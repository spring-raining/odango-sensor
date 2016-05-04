const serialport                = require('serialport');
const SerialPort                = serialport.SerialPort;

const DEVICE_PATH               = require('./defs.json').device_path;
const BAUDRATE                  = require('./defs.json').baudrate;
const METRICS_DEFINITION        = require('./metrics.json');

// Export definitions
if (process.env.MACKEREL_AGENT_PLUGIN_META) {
  console.log('# mackerel-agent-plugin');
  console.log(JSON.stringify(METRICS_DEFINITION));
  return;
}

const sp = new SerialPort(DEVICE_PATH, {
  baudrate: BAUDRATE,
  parser: serialport.parsers.readline('\n'),
}, false);

sp.open((err) => {
  if (err) {
    return console.error('Error opening port: ', err.message);
  }
  sp.on('data', (data) => {
    const parsed = /Humidity:(\S+)\tTemperature:(\S+)/.exec(data);

    if (parsed) {
      callback(parsed[1], parsed[2]);
      sp.close();
    }
  });
});

function callback(humidity, temperature) {
  const now = Date.now();
  console.log(`odango.humidity.my_room\t${humidity}\t${now}`);
  console.log(`odango.temperature.my_room\t${temperature}\t${now}`);
}

