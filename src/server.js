import express from "express";
import handlebars from "express-handlebars";
import { __dirname } from "./path.js";
import { Server } from "socket.io";
import ProductManager from "./manager/productManager.js";

const productmanager = new ProductManager(`${__dirname}/db/products.json`);

const app = express();
app.use(express.json());
app.use(express.static(__dirname + "/public"));

app.engine("handlebars", handlebars.engine());
app.set("view engine", "handlebars");
app.set("views", __dirname + "/views");

const httpServer = app.listen(8080, () => {
  console.log("Escuchando puerto 8080");
});

const socketServer = new Server(httpServer);

app.get("/", async (req, res) => {
  try {
    const products = await productmanager.getProducts();
/*     socketServer.emit("allProducts", products);
 */    res.render("index", { products });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).send("Error al obtener productos");
  }
});

app.get("/productsrealtime",async (req, res) => {
  try{
    const products = await productmanager.getProducts();
    res.render("realtimeproducts",{products});

    socketServer.on("connection", (socket) => {
      socket.on("newProduct", async (product) => {
         const productupd = await productmanager.createProduct(product);
        socket.emit("updateProducts",productupd)
      });
    });
    
 
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).send("Error al obtener productos");
  }})

