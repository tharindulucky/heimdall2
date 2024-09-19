import app from './app';
import {writeLog} from "./utils/logger";
import configs from "./configs";

const port = process.env.PORT || 5000;
app.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`Listening: http://localhost:${port}`);
  writeLog('INFO', `${configs.app_name} running!`);
  /* eslint-enable no-console */
});
