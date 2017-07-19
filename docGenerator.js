(function() {
	var docGenerator;

	docGenerator = function() {
		this.request = function(req) {
			var headers = [];
			var body = [];
			var is_json = false;
			var k, v;
			for (k in req.headers) {
				v = req.headers[k];
				headers.push({ key: k, value: v});
			}
			if (req.body.length > 0) {
				for (k in req.body) {
					v = req.body[k];
					body.push({ key: k, value: v});
				};
			}
			return {
				headers: headers,
				body: body
			};
		};

		this.response = function(res) {
			return res;
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