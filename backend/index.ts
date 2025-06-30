import express from "express";
import {PrismaClient} from "@prisma/client";
import { main } from "./ai";
import cors from "cors";

const prisma = new PrismaClient();

const app = express();
const PORT = 9008;
app.use(express.json());
app.use(cors());

app.post('/review', async(req, res) => {
    try {
        const {code, filename, language} = req.body;
        const prompt = `
You are a senior ${language} developer. Review the following code for:
1. Bugs
2. Performance issues
3. Security issues
4. Best practices

Code:
${code}
    `;

    const feedback = await main(prompt);
        const response = await prisma.codeReview.create({
            data: {
                code,
                filename,
                language,
                feedback: feedback || ""
            }
        })
        res.status(200).json({response});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Internal server error while reviewing code!"});
    }
})

app.listen(PORT, ()=> {
    console.log(`Server running on port ${PORT}`);
})