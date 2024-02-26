export default class Csv extends EventTarget {

    static async load(source, columns, options = {}) {

        console.log('CSV: loading csv from: ' + source);

        const response = await fetch(source);
        if (!response.ok) throw new Error('Failed to load csv: ' + response.status + '\n' + response.statusText);
        let data = await response.arrayBuffer();

        if (data.byteLength === 0) throw new Error('CSV: No data in file.');

        const decoder = new TextDecoder(options.encoding ?? 'utf-8');

        console.log('CSV: decoding data with: ' + (options.encoding ?? 'utf-8'));

        data = decoder.decode(data);

        if (data.length === 0) throw new Error('CSV: Decode failed.');

        console.log('CSV: decoded data: ' + data);

        if (options.regexReplace) console.log('CSV: replacing regex: ' + options.regexReplace);

        if (options.regexReplace) options.regexReplace.forEach(pair => data = data.replace(pair[0], pair[1]));

        const dataArray = data.split('\r\n').map( row => row.split(';') );

        console.log('CSV: data array: ' + dataArray);

        if (options.skipRows) dataArray.splice(0, options.skipRows);

        const json = dataArray.map( row => {
            const obj = {};
            
            columns.forEach( (column, index) => {
                obj[column] = row[index];
            });
            return obj;
        });

        return json;
    }
}