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

        console.log('CSV: decoded data: ' + data.length + ' characters');

        if (options.regexReplace) console.log('CSV: replacing regex: ' + options.regexReplace);

        if (options.regexReplace) options.regexReplace.forEach(pair => data = data.replace(pair[0], pair[1]));

        if (options.regexReplace) console.log('CSV: replaced data: ' + data.length + ' characters');
        

        const dataArray = data.split('\n').map( row => row.split(';') );

        console.log('CSV: data array: ' + dataArray.length + ' rows');

        if (options.skipRows) dataArray.splice(0, options.skipRows);

        const returnObject = dataArray.map( row => {
            const object = {};
            
            columns.forEach( (column, index) => {
                object[column] = row[index];
            });
            return object;
        });

        console.log('CSV return object length: ' + returnObject.length + ' rows');

        return returnObject;
    }
}