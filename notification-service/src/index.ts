import app from './app';
import configs from "./configs";
import {writeLog} from "./utils/logger";

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Listening: http://localhost:${port}`);
  writeLog('INFO', `${configs.app_name} running!`);
});
