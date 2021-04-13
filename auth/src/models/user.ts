import mongoose from "mongoose";
import { Password } from "../utils/password";

interface UserAttrs {
    email: string;
    password: string;
}

//additional method that mongosose model has
interface UserModel extends mongoose.Model<UserDoc> {
    build(attrs: UserAttrs): UserDoc;
}

//addtional properties that mongoose doc has
interface UserDoc extends mongoose.Document {
    email: string;
    password: string;
}

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
    },
    {
        // transform output userschema object
        toJSON: {
            // ret is the object of output
            transform(doc, ret) {
                ret.id = ret._id;
                delete ret._id;
                delete ret.password;
                delete ret.__v;
            },
        },
    }
);

//why function? becasue we want to access this keyword
// if we use arrow it will be over written and apply to this user document
userSchema.pre("save", async function (done) {
    //create new User means isModified = true
    if (this.isModified("password")) {
        const hashed = await Password.toHash(this.get("password"));
        this.set("password", hashed);
    }
    done();
});

userSchema.statics.build = (attrs: UserAttrs) => {
    return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>("User", userSchema);

export { User };
