"use strict";

var Gpio = require("onoff").Gpio;
var Service, Characteristic;

module.exports = function(homebridge)
{
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;

  // Register this accessory as 'GPIO-OnOff'
  homebridge.registerAccessory("homebridge-gpio-onoff", "GPIO-OnOff", GPIOOnOffAccessory);
};

function GPIOOnOffAccessory(log, config)
{
  this.log = log;

  // Read configuration
  this.name = config.name;
  let pin = config.pin;
  let direction = config.direction;
  let edge = config.edge;
  let activeLow = !!config.activeLow;

  let hapService = config.hapService;
  this.hapCharacteristic = config.hapCharacteristic;
  this.trueValue = config.trueValue;
  this.falseValue = config.falseValue;

  // Check configuration
  if (!pin)
    throw new Error("You must provide a config value for pin.");
  if ([ "in", "out" ].indexOf(direction) < 0)
    direction = "in";
  if ([ "none", "rising", "falling", "both" ].indexOf(edge) < 0)
    edge = "none";

  // If the specified service or characteristic is unknown, fall back to generic Switch
  if (!(hapService in Service) || !(this.hapCharacteristic in Characteristic))
    hapService = "Switch";
  // If the service is a Switch, use the On characteristic (will also be triggered when service was unknown)
  if (hapService == "Switch")
  {
    this.hapCharacteristic = "On";
    this.trueValue = true;
    this.falseValue = false;
  }

  // Initialize the GPIO object
  this.sensor = new Gpio(pin, direction, edge, { activeLow: activeLow });

  // Initialize the switch service
  this.service = new Service[hapService](this.name);
  if (direction == "in")
  {
    this.log("Initializing 'in' GPIO accessory on pin " + pin);
    this.service
        .getCharacteristic(Characteristic[this.hapCharacteristic])
        .on("get", this.readGPIO.bind(this));

    if (edge != "none")
      this.sensor.watch(this.onGPIOChange.bind(this));
  }
  else if (direction == "out")
  {
    this.log("Initializing 'out' GPIO accessory on pin " + pin);
    this.service
        .getCharacteristic(Characteristic[this.hapCharacteristic])
        .on("set", this.writeGPIO.bind(this));
  }
}

GPIOOnOffAccessory.prototype.getServices = function()
{
  return [this.service];
};

GPIOOnOffAccessory.prototype.gpioToCharacteristic = function(value)
{
  return value == 1 ? this.trueValue : this.falseValue;
};

GPIOOnOffAccessory.prototype.characteristicToGPIO = function(value)
{
  return value == this.trueValue;
};

GPIOOnOffAccessory.prototype.readGPIO = function(callback)
{
  this.log("Reading GPIO value");
  this.sensor.read((err, value) =>
  {
    if (err)
      callback(err);
    else
    {
      let charValue = this.gpioToCharacteristic(value);
      this.log(`Read GPIO value ${value} as ${charValue}`);
      callback(null, charValue);
    }
  });
};

GPIOOnOffAccessory.prototype.writeGPIO = function(value, callback)
{
  let gpioValue = this.characteristicToGPIO(value);
  this.log(`Writing Characteristic value ${value} as ${gpioValue}`);
  this.sensor.write(value, err =>
  {
    if (err)
      callback(err);
    else
    {
      this.log("Wrote GPIO value");
      callback();
    }
  });
};

GPIOOnOffAccessory.prototype.onGPIOChange = function(err, value)
{
  if (!err)
  {
    let charValue = this.gpioToCharacteristic(value);
    this.log(`Received GPIO value ${value} as ${charValue}`);
    this.service
        .getCharacteristic(Characteristic[this.hapCharacteristic])
        .setValue(charValue);
  }
};
