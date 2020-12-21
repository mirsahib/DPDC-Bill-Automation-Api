const puppeteer = require("puppeteer");

module.exports.run = async function (req, res) {
  const browser = await puppeteer.launch({
    //headless: true, // debug only
    args: ["--no-sandbox"],
  });
  let customer_no = process.env.CUSTOMER_NO.split(",");
  let year = req.query.year;
  let month = req.query.month;
  try {
    const data = [];
    for (customer of customer_no) {
      const url = `https://dpdc.org.bd/service/ebill?btyp=current&year=${year}&month=${month}&cno=${customer}&email=`;
      const page = await browser.newPage();
      await page.goto(url, {
        waitUntil: "networkidle0",
      });
      const table_cell = await page.evaluate(() => {
        const cell = document.querySelectorAll("td");
        const customer_name = cell[8].innerText.replaceAll("\n", " ");
        const meter_no = cell[47].innerText;
        const reading_history = cell[55].innerText.split("\n");
        const prev_reading = reading_history[0];
        const current_reading = reading_history[1];
        const unit_consumtion = reading_history[2];
        const amount = Number(cell[82].innerText);
        const amount_with_fine = Number(cell[86].innerText);
        return {
          Name: customer_name,
          Meter_No: meter_no,
          Previous_Reading: prev_reading,
          Current_Reading: current_reading,
          Unit_Consumption: unit_consumtion,
          Amount: amount,
          Amount_With_Fine: amount_with_fine,
        };
      });
      data.push(table_cell);
    }

    res.send(data);
    //res.status(200).json({ year: year, month: month });
  } catch (error) {
    res.status(500).json({ success: false, error: error });
  } finally {
    await browser.close();
  }
};
