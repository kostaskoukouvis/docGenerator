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
		this.formatRequest = function(req) {
			var headers = [];
			var urlQuery = [];
			var is_json = false;
			var body, k, v;
			var query = req.getUrlParameters();
			for (k in query){
				v = query[k]
				urlQuery.push({ key: k, value: v})
			}
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
					body = JSON.stringify(JSON.parse(requestBody), null, 4);
				} else {
					body = requestBody;
				}
			}
			return {
				"urlQuery?": query != "",
				urlQuery: urlQuery,
				"headers?": headers.length > 0,
				headers: headers,
				"body?": body != undefined,
				body: body
			};
		};

		this.formatExchanges = function(exchanges) {
			var excArr = [];
			for (exchange of exchanges) {
				res = this.formatExchange(exchange);
				excArr.push(res);
			}
			return excArr
		}

		this.formatExchange = function(exchange) {
			var body, hasBody;
			if (!exchange.responseBody) {
				hasBody = false
			}
			if (exchange.responseHeaders['Content-Type'] && exchange.responseHeaders['Content-Type'].search(/(json)/i) > -1) {
				hasBody = true
				body = JSON.stringify(JSON.parse(exchange.responseBody), null, 4);
			} else {
				hasBody = true
				body = exchange.responseBody
			}
			return {
				statusCode: exchange.responseStatusCode,
				"body?": hasBody,
				body: body
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
				path: this.path(pawRequest.urlBase),
				description: pawRequest.description,
				request: this.formatRequest(pawRequest),
				exchanges: this.formatExchanges(pawRequest.getAllExchanges())
			});
		};
	};

	docGenerator.identifier = "io.github.kostaskoukouvis.docGenerator";
	docGenerator.title = "API Documentation Generator"
	docGenerator.fileExtension = "md";
	registerCodeGenerator(docGenerator);

}).call(this);