const { readFileFromS3, saveBufferToS3 } = require('../../middlewares/aws');
const { generateExcel } = require('../../utils/excel-utils');
const { updateParserDlKey, updateParserInfo } = require('../../middlewares/msc');

const ExcelJS = require('exceljs');

const parseBogsInv = async (req, res, next, batchId) => {
    const { filename } = req.body;
    const workbook = new ExcelJS.Workbook();
    const streamFile = await readFileFromS3('imports-parser', filename);
    const wb = await workbook.xlsx.read(streamFile);
    const result = [];
    const sheetName = workbook.worksheets.map(sheet => sheet.name);
    try {
        let defaultHeader = {
            tab: 'File tab Name',
            scale: 'Scale',
            styleCC: 'Style-Color',
            styleName: 'Style Name',
            colorName: 'Color Name',
            dim: 'Dim',
            gender: 'Gender',
            productClass: 'Product Class',
            infoType: 'Info Type',
            wipETA: 'WIP ETA',
            size: 'Size',
            qty: 'Qty',
            awpwh: 'AWPWH'
        }
        result.push(defaultHeader);
        let sizesArr = []

        wb.eachSheet(function (worksheet) {
            const rows = worksheet.getSheetValues();

            for (let x = 4; x <= rows.length; x++) {
                let row = rows[x]

                if (row && row[2] && row[2] !== 'Scale') {
                    sizesArr = row
                }
                if (row && !row[2] && row[3]) {
                    for (let i = 13; i < (13 + 24); i++) {
                        if (row[i] !== '' && row[i] !== null) {
                            result.push({
                                tab: sheetName[0],
                                scale: sizesArr[2].richText[0].text,
                                styleCC: row[3],
                                styleName: (row[4].richText[0].text).trim(),
                                colorName: row[5].richText[0].text,
                                dim: (row[6].richText[0].text).trim(),
                                gender: (row[7].richText[0].text).trim(),
                                productClass: (row[9].richText[0].text).trim(),
                                infoType: (row[10].richText[0].text).trim(),
                                wipETA: (row[11].richText[0].text).trim(),
                                size: sizesArr[i].trim(),
                                qty: row[i].richText[0].text,
                                awpwh: (row[37].richText[0].text).trim(),
                            })
                        }
                    }
                }
            }
        });

        //-----------------------
        
        const HEADERS = Object.keys(result[0]).map((item, index) => {
            return {
                header: Object.values(result[0])[index],
                key: item
            };
        });

        const ROWS = result.slice(1);
        const FILENAME = `${batchId}-parsed.xlsx`;

        let bufferData = await generateExcel([
            {
                sheetName: 'Result',
                columns: HEADERS,
                rows: ROWS
            }
        ]);

        let s3Response = await saveBufferToS3({
            keyName: `downloads/${FILENAME}`,
            contentType: 'application/octet-stream',
            base64: bufferData
        });

        if (s3Response.Location) {
            await updateParserDlKey(batchId, s3Response.Location);
            res.status(200).json({ success: true });
        }
        else {
            res.status(200).json({ success: false });
        }

    } catch (error) {
        await updateParserInfo(batchId, error.message);
        res.status(500).json({ error: error.message });
    }
}

module.exports = parseBogsInv;