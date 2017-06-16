import { Button, Menu, MenuDivider, MenuItem } from "@blueprintjs/core";
import React, { PropTypes } from 'react';

import { csltoBibtex } from '../references/csltobibtex';
import { markdownToExport } from '../ExportMenu';
import request from 'superagent';

let styles;

// converter url

export const ExportButton = React.createClass({
	propTypes: {
		files: PropTypes.object,
	},

  getInitialState() {
		return {
			exportLoading: undefined,
			exportError: undefined,
			exportUrl: undefined,
			pdftexTemplates: {},
		}
	},

  componentWillMount: function() {

    const { converterURL } = this.props;

    const reqURL = converterURL + '/templates';

    if (Object.keys(this.state.pdftexTemplates).length === 0 && this.state.pdftexTemplates.constructor === Object) {
      request
      .get(reqURL)
      .end((err, res) => {
        this.setState({
          pdftexTemplates: res.body
        });
      });
    }
  },

  pollURL: function(url) {

    const { converterURL } = this.props;
		const pollUrl = converterURL + url;

		request
		.get(pollUrl)
		.end((err, res) => {

			if (!err && res && res.statusCode === 200) {

				if (res.body.url) {

          window.open(res.body.url, "_blank");
					this.setState({
						exportLoading: false,
						exportUrl: res.body.url
					});
				} else {
					window.setTimeout(this.pollURL.bind(this, url), 2000);
				}
			} else if (err) {
				console.log(`error is ${err}, res is ${JSON.stringify(res)}`)
				this.setState({
					exportError: `${err}, ${res.text}`,
					exportLoading: false

				});

			}
		});
	},

  convert: function() {

    if (this.state.exportLoading) {
      return false;
    }

    const { converterURL, allFiles, allReferences, content, title, authors } = this.props;
		const convertUrl = converterURL;
		const outputType = 'pdf';
		const inputContent = markdownToExport(content, allFiles, allReferences);

		const metadata = { title, authors };

    const template = this.state.pdftexTemplates['default'];

		this.setState({
			exportLoading: true,
		});

		request
		.post(convertUrl)
		.send({
			inputType: 'ppub',
			outputType: outputType,
			// inputUrl: file.url,
			inputContent: inputContent,
			metadata: metadata,
			options: { template: 'default' }
		})
		.set('Accept', 'application/json')
		.end((err, res) => {
			if (err || !res.ok) {
				alert('Oh no! error', err);
			} else {
				const pollUrl = res.body.pollUrl;
				window.setTimeout(this.pollURL.bind(this, pollUrl), 2000);
			}
		});
	},

	render: function() {

		const { className, style } = this.props;
    const { exportLoading } = this.state;

		return (
			<Button className={className} style={style} loading={exportLoading} onClick={this.convert}>
        Export
			</Button>
		);
	}

});

export default ExportButton;

styles = {
  button: {

  }
};
