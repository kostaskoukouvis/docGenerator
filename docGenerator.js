(function() {
	var docGenerator;

	(function(root) {
		var ref;
		if ((ref = root.bundle) != null ? ref.minApiVersion('0.2.0') : void 0) {
		  return root.Mustache = require("./mustache");
		} else {
		  return require("mustache.js");
		}
	})(this);

	docGenerator = function() {
		this.request = function(req) {
			var headers = [];
			var body = [];
			var is_json = false;
			var k, v;
			for (k in req.headers) {
				v = req.headers[k];
				if (k === "Content-Type") {
					is_json = v.search(/(json)/i) > -1;
					continue;
				}
				headers.push({ key: k, value: v});
			}

			if (req.body.length > 0) {
				var requestBody = req.body
				if (is_json) {
					requestBody = JSON.parse(requestBody);
				}
				for (k in requestBody) {
					v = requestBody[k];
					body.push({ key: k, value: v});
				};
			}
			return {
				"headers?": headers.length > 0,
				headers: headers,
				"body?": body.length > 0,
				body: body
			};
		};

		this.response = function(res) {
			if (res.responseBody.length > 0) {
				var k, v, val;
				var body = [];
				var resBody = JSON.stringify(JSON.parse(res.responseBody), null, 4);
				// if (is_json) {
				// 	requestBody = JSON.parse(requestBody);
				// }
				// for (k in resBody) {
				// 	v = resBody[k];
				// 	body.push({ key: k, value: v});
				// };
			}
			return {
				statusCode: res.responseStatusCode,
				"body?": true,
				body: resBody
			};
		};

		this.path = function(url) {
			var path = url.replace(/^https?:\/\/[^\/]+/i, '');
			if (!path) {
				path = '/';
			}
			return path;
		};

		this.generate = function(context) {
			var pawRequest = context.getCurrentRequest();
			var template = readFile("docGenerator.mustache");
			return Mustache.render(template, {
				method: pawRequest.method,
				path: this.path(pawRequest.url),
				request: this.request(pawRequest),
				response: this.response(pawRequest.getLastExchange())
			});
		};
	};

	docGenerator.identifier = "io.github.kostaskoukouvis.docGenerator";
	docGenerator.title = "API Documentation Generator"
	docGenerator.fileExtension = "md";
	registerCodeGenerator(docGenerator);

}).call(this);