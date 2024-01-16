
const sendEmailController = (req, res) => {

    try{
        return res.send({
            success: true,
            message: 'Your Message was sent!'
        
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).send({
            success: false,
            message: 'email api error',
            error
    })
    }
}


module.exports = {sendEmailController};