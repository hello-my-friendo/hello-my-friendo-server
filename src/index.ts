import {app} from './app';
import {config} from './config';

app.listen(config.port, () => {
  console.log(`Hello, My Friendo! server listening on port ${config.port}...`);
});
