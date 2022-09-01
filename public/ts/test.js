console.time("timer1");
fetch('http://localhost:8000/data')
    .then((response) => response.json())
    .then((data) => {
        console.log(data)
        // console.log(data[0][7])
        console.timeEnd("timer1");
    });

