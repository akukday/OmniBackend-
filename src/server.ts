import { config } from "dotenv";

//START: Load envirnment 
console.log(process.env.NODE_ENV);
if(process.env.NODE_ENV?.trim() != 'local') {
  config({ path: `.env.${process.env.NODE_ENV?.trim()}` });
} else {
  config({ path: `.env.${process.env.NODE_ENV?.trim()}` });
}
import app from "./app";
//END

const EVENT_SERVICE_PORT = process.env.EVENT_SERVICE_PORT;
app.listen(EVENT_SERVICE_PORT, () => {
  console.log(`App Started on ${EVENT_SERVICE_PORT}`);
});
