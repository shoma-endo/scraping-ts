import express from "express";
import scraperRoutes from "./routes/scraperRoutes";

const app = express();
const PORT: number = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use("/", scraperRoutes);

app.listen(PORT, () => {
  console.log(`サーバーがポート ${PORT} で起動しました`);
});
