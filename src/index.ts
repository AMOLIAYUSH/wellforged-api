import express, { type Application, type Request, type Response } from "express";
import cors from "cors";
import helmetModule from "helmet";
import { rateLimit } from "express-rate-limit";
import dotenv from "dotenv";
import morgan from "morgan";

import pool from "./config/db.js";
import logger from "./utils/logger.js";

import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import couponRoutes from "./routes/coupon.routes.js";
import reviewRoutes from "./routes/review.routes.js";

import { errorHandler } from "./middlewares/error.middleware.js";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;
const helmet = helmetModule as unknown as () => express.RequestHandler;


// ---------------- RATE LIMITERS ----------------

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again after 15 minutes",
    standardHeaders: true,
    legacyHeaders: false,
});

// ---------------- MIDDLEWARE ----------------

app.use(helmet());
app.use(limiter);
app.use(express.json());


// ---------------- CORS ----------------

const allowedOrigins = (process.env.ALLOWED_ORIGIN || "")
    .split(",")
    .map((o) => o.trim());

app.use(
    cors({
        origin: (origin, callback) => {
            if (process.env.NODE_ENV !== "production") {
                return callback(null, true);
            }

            if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: true,
        exposedHeaders: ["set-cookie"],
    })
);


// ---------------- LOGGING ----------------

const morganFormat = process.env.NODE_ENV === "production" ? "combined" : "dev";

app.use(
    morgan(morganFormat, {
        stream: {
            write: (message) => logger.info(message.trim()),
        },
    })
);


// ---------------- ROUTES ----------------

app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api", productRoutes);


// ---------------- HEALTH CHECK ----------------

app.get("/health", (req: Request, res: Response) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
    });
});


// ---------------- ERROR HANDLER ----------------

app.use(errorHandler);


// ---------------- DATABASE TEST ----------------

async function testDatabase() {
    try {
        const res = await pool.query("SELECT NOW()");
        logger.info(`Database connected at ${res.rows[0].now}`);
    } catch (error) {
        logger.error("Database connection failed", { error });
    }
}


// ---------------- SERVER START ----------------

if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, async () => {
        logger.info(`Server running on port ${PORT}`);
        await testDatabase();
    });
}


// ---------------- EXPORT FOR SERVERLESS ----------------

export default app;
