import axios from "axios";
import mysql from "mysql2/promise";

async function fetchProducts() {
  try {
    const options = {
      method: "GET",
      url: "https://real-time-product-search.p.rapidapi.com/search",
      params: {
        q: "roccat",
        country: "us",
        language: "en",
        limit: "100",
        sort_by: "BEST_MATCH",
        product_condition: "NEW",
        min_rating: "ANY",
      },
      headers: {
        "x-rapidapi-key": "f6d1f840a3msh19d03ebda2bde72p14ca93jsn16413aedab2d",
        "x-rapidapi-host": "real-time-product-search.p.rapidapi.com",
      },
    };

    try {
      const response = await axios.request(options);
      console.log(response.data);
      const products = response.data.products.map((product) => ({
        id: product.id,
        title: product.title,
        brand: product.brand,
        price: product.price,
        currency: product.currency,
        image: product.image,
        url: product.url,
      }));

      if (products.length === 0) {
        console.log("No products found.");
        return;
      }
      const columns = Object.keys(products[0]).map(
        (column) => `${column} VARCHAR(255)`
      );
      const createTableQuery = `CREATE TABLE IF NOT EXISTS products (${columns.join(
        ", "
      )})`;
      const connection = await mysql.createConnection({
        host: "https://localhost:3306",
        user: "root",
        password: "root",
      });
      await connection.query(createTableQuery);
      console.log("Table created successfully");

      const insertProducts = async () => {
        const insertProductsQuery = `INSERT INTO products (${Object.keys(
          products[0]
        ).join(", ")}) VALUES ${products
          .map((product) => `(${Object.values(product).join(", ")})`)
          .join(", ")}`;
        await connection.query(insertProductsQuery);
        console.log("Products inserted successfully");
      };
      insertProducts();
    } catch (error) {
      console.error(error);
    }
  } catch (error) {
    console.error(error);
  }
}
fetchProducts();
