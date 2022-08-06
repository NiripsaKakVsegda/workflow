const getUser = require("./get_user");
const fs = require("fs");

async function changeAvatar (req, res) {
    const user = await getUser(req);
    try { fs.unlink('public/uploads/' + user.avatar.filename, ()=>{}); } catch (e) {console.log(e)}
    if (req.file.size > 10485760) {res.status(403).json({message: 'file is too large'});}
    user.avatar = {filename: req.file.filename, contentType: req.file.mimetype}
    await user.save();
    res.status(200).json({fname: req.file.filename});
}

module.exports = changeAvatar;