const {getAllCommits} = require('./middlewares/github-services');

const releaseNotesInit = async (req, res, next) => {
    let result = [];
    try{
        const exec = await getAllCommits();
        exec.forEach(item => {
            result.push({
                message: item.commit.message, 
                date: new Date(item.commit.committer.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) 
            });
        });
        res.status(200).json({result});
    }catch(error){
        next(error);
    }
}

module.exports = releaseNotesInit;

//http://localhost:4200/api/v1/repo/get/commits