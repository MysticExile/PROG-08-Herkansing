import {createChart, updateChart} from "./scatterplot.js"

let saveBtn = document.getElementById('saveBtn');

//
// csv data
//
function loadData() {
    Papa.parse("../data/medic.csv", {
        download: true,
        header: true,
        dynamicTyping: true,
        complete: results => checkData(results.data)
    })
}

function checkData(data) {
    // shuffle & split
    data.sort(() => (Math.random() - 0.5))
    let trainData = data.slice(0, Math.floor(data.length * 0.8))
    let testData = data.slice(Math.floor(data.length * 0.8) + 1)

    const chartdata = trainData.map(person => ({
        x: person.bmi,
        y: person.charges,
    }))

    // logt de data om te kijken of het goed is
    console.log(chartdata)

    // chart aanroepen
    createChart(chartdata, "bmi", "charges")

    neuralNetwork(trainData, testData);
}

function neuralNetwork(trainData, testData) {
    //
    // Neural Network
    //
    const nn = ml5.neuralNetwork({task: 'regression', debug: true})

    // data aan neural network tooevoegen
    for (let person of trainData) {
        nn.addData({
            age: person.age,
            sex: person.sex,
            bmi: person.bmi,
            children: person.children,
            smoker: person.smoker,
            region: person.region
        }, {charges: person.charges})
    }

    nn.normalizeData()

    nn.train({epochs: 6}, () => finishedTraining(nn, testData))
}

async function finishedTraining(nn, testData) {
    console.log("Finished training!")

    saveBtn.addEventListener("click", function () {
        saveModel(nn)
    });

    makePrediction(nn, testData);
}

async function makePrediction(nn, testData) {
    console.log("Making prediction..")

    const testPerson = {
        age: testData[0].age,
        sex: testData[0].sex,
        bmi: testData[0].bmi,
        children: testData[0].children,
        smoker: testData[0].smoker,
        region: testData[0].region
    }
    const results = await nn.predict(testPerson);
    console.log(`Geschatte Prijs: ${results[0].charges}`)

    let predictions = []
    for (let i = 0; i < testData.length; i += 1) {
        const prediction = await nn.predict({
            age: testData[i].age,
            sex: testData[i].sex,
            bmi: testData[i].bmi,
            children: testData[i].children,
            smoker: testData[i].smoker,
            region: testData[i].region
        })
        predictions.push({x: testData[i].bmi, y: prediction[0].charges})
    }

    updateChart("Predictions", predictions)
}

function saveModel(nn) {
    nn.save()
}

// load data
loadData();