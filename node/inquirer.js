const inquirer = require('inquirer')

var questions = [
  { type: 'input', name: 'name', message: "What's your name?" },
  { 
    type: 'rawlist', 
    name: 'years', 
    message: "When was PRC founded?", 
    choices: [ "1945", new inquirer.Separator(), "1949", new inquirer.Separator(), "1955" ]
  },
  {
    type: 'checkbox',
    name: 'favor',
    message: "What's your favor?",
    choices: [ "Azure", new inquirer.Separator(), "Blue Violet" ]
  },
]

inquirer.prompt(questions).then(answers => {
  console.log(`Hi ${answers['name']}!`, answers)
})