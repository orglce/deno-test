fetch('http://localhost:8000/perDay')
    .then(r => r.json()).then(data => {
    // const dates = new Set();
    // const lukaNum = [];
    // const ajdaNum = [];
    // for (const item of data) {
    //
    //     if (item[1] === null) {
    //         lukaNum.push(item[2]);
    //     } else {
    //         ajdaNum.push(item[2]);
    //     }
    //     dates.add(new Date(item[0]).toLocaleDateString("sl-SI"));
    // }
    // const datesArray = Array.from(dates);
    for (const item of data) {
        const numOfSenders = item[2].split(",")
        if (numOfSenders.length === 2) {
            if (parseInt(numOfSenders[0]) > parseInt(numOfSenders[1])) {
                console.log(numOfSenders)
            }

        }
    }
    // console.log(data)

    // const ctx = document.getElementById("myChart").getContext("2d");
    // let numOfMessagesChart = new Chart(ctx, {
    //     type: "bar",
    //     data: {
    //         labels: datesArray,
    //         datasets: [{
    //             label: "Luka",
    //             data: lukaNum,
    //             backgroundColor: [
    //                 "rgba(0, 99, 255, 0.2)",
    //             ],
    //             borderColor: [
    //                 "rgba(0, 99, 255, 1)",
    //             ],
    //             borderWidth: 1,
    //         }, {
    //             label: "Ajda",
    //             data: ajdaNum,
    //             backgroundColor: [
    //                 "rgba(255, 0, 0, 0.2)",
    //             ],
    //             borderColor: [
    //                 "rgba(255, 0, 0, 1)",
    //             ],
    //             borderWidth: 1,
    //         }],
    //     },
    //     options: {
    //         scales: {
    //             y: {
    //                 beginAtZero: true,
    //             },
    //         },
    //     },
    // });
});