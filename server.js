const http = require('http');
const formidable = require('formidable');
const fs = require('fs');
const util = require('util');
const mime = require('mime');
const path = require('path');
const querystring = require('querystring');

const server = http.createServer((req, res) => {

	if (req.url === '/favicon.ico') return;

	if (req.url.indexOf('.') === -1 && req.url === '/') {

		fs.readFile('./static/form.html', (err, data) => {
			if (err) console.log(err);
			res.writeHead(200, {"Content-Type": "text/html; charset=utf-8;"});
			res.end(data);		
		});

	} else if (req.url === '/upload' && req.method.toLowerCase() === 'post') {

		const form = new formidable.IncomingForm();

		form.uploadDir = './static/upload';			//文件夹需存在
		form.keepExtensions = true;

		/**
		 * @param name => avatar, 属性名，不是文件名
		 */
		form.on('file', (name, file) => {			//监听文件上传成功，并更改文件名

			if (!file.name) return;

			fs.rename(`./${file.path}`, `./static/upload/${file.name}`);
		});
													//未提交文件
		form.onPart = (part) => {					//multipart stream: name => gender => career => avatar;
			if (part.name === "avatar" && part.filename === "") return;
			if (part.name === "avatar1" && part.filename === "") return;
			if (part.name === "avatar2" && part.filename === "") return;
			if (part.name === "avatar3" && part.filename === "") return;

			form.handlePart(part);
		}

		// form.on('field', (key, value) => {		//handlePart内触发事件，可以监听
		// 	console.log(key + ',' + value);
		// });

		form.parse(req, (err, fields, files) => {	//未提交文件时，会生成空文件，所以加上onPart

			if (err) console.log(err);

			res.writeHead(200, {"Content-Type": "text/plain; charset=utf-8;"});
			res.end(`${fields.name} 信息提交成功!`);
		});

		return;

	} else if (req.url === '/download') {							//显示可下载文件

		fs.readdir('./static/download', (err, files) => {

			res.writeHead(200, {"content-type": "text/html; charset=utf-8;"});

			files.forEach((filename, index) => {
				let filepath = encodeURI(`download/file/${filename}`);	//url编码
				res.write(`<a href=${filepath}>${filename}</a><br />`)
			});

			res.end();
		})

		return;

	} else if (req.url.indexOf('download/file') > -1) {		//文件下载

		let filename = path.basename(req.url);
		filename = decodeURI(filename);						//url解码(特殊字符req.url不解析)

		fs.stat(`./static/download/${filename}`, (err, stats) => {	
			if (err) {										//判断文件是否存在
				console.log(err);
				res.end();

				return;
			}
			// if (!stats.isFile()) return;					

			let mimetype = mime.lookup(filename);
			let filepath = `./static/download/${filename}`;

			if (!path.extname(req.url)) return;

			res.setHeader('Content-disposition', `attachment; filename=${encodeURI(filename)};`);
			// res.setHeader('Content-disposition', `attachment; filename=${encodeURI(filename)}; filename*=utf-8''${ decodeURI(filename) }`);
			res.writeHead(200, {"content-type": `${mimetype}`});

			fs.createReadStream(filepath).pipe(res);
		});

		return;			//没有res.end，第二次访问时会报错
						// Can't set headers after they are sent
	} else {

		fs.readFile('./static/404.html', (err, data) => {

			if (err) console.log(err);
			
			res.writeHead(200, {"content-type": "text/html; charset=utf-8"});
			res.end(data);
		});

		return;
	}


}).listen(3000, '192.168.1.158');
