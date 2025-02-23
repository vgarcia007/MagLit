import { doc, getDoc } from "firebase/firestore";
import { db } from "../../utils/firebase";
import crypto from "crypto-js";

export default async function handler(req, res) {
  const { slug, password } = req.body;
  const collectionName =
    process.env.NODE_ENV === "production" ? "links" : "testLinks";

  try {
    if (slug.length < 1) {
      return res.status(400).json({ message: "Link doesn't exist" });
    }

    // check firebase if slug exists
    const documentRef = doc(db, collectionName, slug);
    const documentSnapshot = await getDoc(documentRef);

    if (!documentSnapshot.exists()) {
      // return 401 if slug doesn't exist
      return res.status(404).json({
        message: "Link doesn't exist",
        linkData: {
          link: "",
          protected: "false",
        },
      });
    } else {
      // get link details
      const linkData = documentSnapshot.data();
      const { link } = linkData;
      const isProtected = linkData.protected;
      let decryptedLink = "";

      // set passwords
      const withPassword = process.env.SECRET_KEY + password;
      const withoutPassword = process.env.SECRET_KEY;

      try {
        decryptedLink = crypto.AES.decrypt(
          link,
          isProtected ? withPassword : withoutPassword
        ).toString(crypto.enc.Utf8);
      } catch (error) {
        console.log(error);
      }

      // check protected link
      if (decryptedLink.length < 1) {
        return res.status(403).json({ message: "Wrong Password!", linkData });
      }

      // if password is correct
      return res.status(200).json({
        message: "Link found!",
        linkData: JSON.parse(decryptedLink),
      });
    }
  } catch (err) {
    console.log(err);
  }
}
