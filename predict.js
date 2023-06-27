const resultField = document.getElementById('result');
const predictBtn = document.getElementById('predictBtn').addEventListener("click", function () {
    makePrediction()
});
const ageInput = document.getElementById("age");
const sexInput = document.getElementById("sex");
const bmiInput = document.getElementById("bmi");
const childrenInput = document.getElementById("children");
const smokerInput = document.getElementById("smoker");
const regionInput = document.getElementById("region");
const errorField  = document.getElementById('error');

const nn = ml5.neuralNetwork({task: 'regression', debug: true})
nn.load('./model/model.json', modelLoaded)

function modelLoaded() {
    console.log("Model loaded!")
}

async function makePrediction() {
    errorField.innerHTML = ""

    const predictionValues = {
        age: parseInt(ageInput.value, 10),
        sex: sexInput.value,
        bmi: parseInt(bmiInput.value, 10),
        children: parseInt(childrenInput.value, 10),
        smoker: smokerInput.value,
        region: regionInput.value
    }

    const results = await nn.predict(predictionValues);

    if (isNaN(results[0].charges)) {
        errorField.innerHTML = "Something went wrong. Please try again!"
    } else {
        console.log(`Predicted price: ${results[0].charges}`)
        currencyTransformer(results[0].charges);
    }

    resultField.className += ' result';
}

function currencyTransformer(result) {
    const fmt = new Intl.NumberFormat('us-US', {style: 'currency', currency: 'USD'});
    resultField.innerHTML = "Predicted Price based on input: " + fmt.format(result);
}