# Homebridge GPIO

Supports triggering General Purpose Input Output (GPIO) pins on platforms supporting the [onoff](https://www.npmjs.com/package/onoff) package. It is based on [homebridge-gpio](https://www.npmjs.com/package/homebridge-gpio), but using the onoff package instead of pi-gpio to be able to listen for changes in pin values.

## Requirements
-  [Homebridge](https://github.com/nfarina/homebridge) - _HomeKit support for the impatient_
-  [onoff](https://www.npmjs.com/package/onoff) - _Reading and writing GPIO pins and listening for changes_

## Installation
1.  Install Homebridge using `npm install -g homebridge`
2.  Install this plugin `npm install -g homebridge-gpio-onoff`
3.  Update your configuration file

## Configuration
Example `config.json`, creating a switch accessory that the user can switch on and off, setting the GPIO pin value to '1' or '0', respectively:

```json
{
  "accessories": [
    {
      "accessory": "GPIO-OnOff",
      "name": "GPIO-7",
      "pin": 7,
      "direction": "out"
    }
  ]
}
```

`accessory` should be set to `GPIO-OnOff` for this plugin.
`name` is the accessory's name, which is shown in HomeKit.
`pin` is the physical GPIO pin number.
`direction` can be set to either `in` to read from the GPIO pin or `out` to write to the pin. If set to `in`, the `edge` property can be set to `rising`, `falling` or `both` to have a changing GPIO pin value trigger an accessory value change (it is set to `none` by default).

By default, a simple 'Switch' accessory is created, which will be set to 'On' or 'Off' by a change in the input value. It is possible to change the service type and even the `true` and `false` values. For example, to have it act like a light sensor, you can specify:

```json
{
  "accessories": [
    {
      "accessory": "GPIO-OnOff",
      "name": "GPIO-7",
      "pin": 7,
      "direction": "in",
      "edge": "both",
      "activeLow": true,
      "hapService": "LightSensor",
      "hapCharacteristic": "CurrentAmbientLightLevel",
      "trueValue": 100000,
      "falseValue": 0.0001
    }
  ]
}
```

`activeLow` will treat '0' as the `true` value and '1' as the `false` value.
`hapService` can be set to one of the defined services in [HomeKitTypes.js](https://github.com/KhaosT/HAP-NodeJS/blob/master/lib/gen/HomeKitTypes.js) and `hapCharacteristic` to one of the characteristics defined for the service.
If the characteristic values are not boolean, you can specify the values for `true` and `false` by setting `trueValue` and `falseValue`, respectively.
