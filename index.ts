/** @format */

// envs
import * as dotenv from "dotenv";
dotenv.config();
import { env } from "process";

// Express
import express, { Request, Response } from "express";
const app = express();
const port = 8080;

// Sentry
import * as Sentry from "@sentry/node";

// DB
import mongoose from "mongoose";
const { Schema } = mongoose;

interface IMovie {
	name: String;
	release: Date;
	rating?: string;
}

const movieSchema = new Schema<IMovie>({
	name: { type: String, required: true },
	release: { type: Date, required: true },
	rating: { type: Number, required: false },
});

const movie = mongoose.model<IMovie>("Movie", movieSchema);

mongoose
	.connect(
		"your MongoDB connection URI here"
	)
	.then(() => {
		console.log("Connected to DB");
	})
	.catch((err) => {
		throw error(err);
	});
// Misc
import { error } from "console";

app.use(express.json());
// app.use(cors()) npm install cors TODO
Sentry.init({
	dsn: env.SENTRY_DSN,

	// We recommend adjusting this value in production, or using tracesSampler
	// for finer control
	tracesSampleRate: 1.0,
});

app.get("/", (req: Request, res: Response) => {
	res.status(200).json({ status: "Working..." });
});

app.post("/add-movie", async (req: Request, res: Response) => {
	let name = await req.body.name;
	let rating = await req.body.rating;
	try {
		if (!name) {
			return res.status(400).json({
				success: false,
				error: "No name given",
			});
		} else if (name) {
			try {
				const movieDetails = new movie({
					name: name,
					release: Date.now(),
					rating: rating,
				});
				await movieDetails.save();
				return res.status(201).json({
					success: true,
				});
			} catch (error) {
				console.error(error);
				return res.status(500).json({
					success: false,
				});
			}
		}
	} catch (err) {
		throw error(err);
	}
});

app.get("/get-movies", async (req: Request, res: Response) => {
	const name = req.body.name;
	// Send request to MongoDB to fetch all the movies with name that is specified.
	try {
		const movieFound = await movie.find({
			name: name,
		});

		return res.status(200).json({
			success: true,
			movieFound,
		});
	} catch (err) {
		res.status(400).json({
			success: false,
		});
	}
});

app.listen(port, () => {
	console.log(`Online on https://localhost:${port}`);
});
