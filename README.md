# PubPub Editor

A stand alone, extensible WSIWYG editor based on [ProseMirror](https://prosemirror.net/). 

## Usage

```bash
npm install @pubpub/editor
```
```javascript
import { Editor } from '@pubpub/editor';

const component = (props)=> {
    return ( 
        <Editor />
    );
}
```

## Development

### To Install and run Storybook

The first step is to create a `stories/_config.js` file. There is a `stories/_sampleConfig.js` file that can be used as a template. The `stories/_config.js` file is necessary to store access keys for external services used by the Editor. Currently, the only external dependency is an Amazon S3 bucket which is used to store uploading files. The `stories/_config.js` file is not and should not be synced into your Github repository (it is listed in the .gitignore file) because the sensitive credentials it contains should never be shared publicly.

After that, the following commands will get you running!
```
npm install
npm start
```



## Addons
The PubPub Editor uses a system of Addons to extend functionality of the editor beyond basic text. Addons enable everything from interactive menus, to custom document elements, to custom editor behavior.

Addons are imported and passed as children to the main Editor component.
```javascript
import { Editor } from '@pubpub/editor';
import FormattingMenu from '@pubpub/editor/addons/FormattingMenu';
import InsertMenu from '@pubpub/editor/addons/InsertMenu';
import Image from '@pubpub/editor/addons/Image';
import Latex from '@pubpub/editor/addons/Latex';

const component = (props)=> {
    return (
        <Editor>
            <FormattingMenu />
            <InsertMenu />
            <Latex renderFunction={renderLatex} />
            <Image handleFileUpload={uploadFunction} />
        </Editor>
    );
}
```

A list of available addons can be found in the [documentation](https://pubpub.github.io/pubpub-editor/);

### Writing New Addons
New addons for the PubPub editor can be written and submitted as pull-requests to the main repo, or created within your local app for personal use. 

Addons are written simply as React components. All addons are passed the following props, in addition to their original props:
```javascript
{
    view: object, // ProseMirror view object
    editorState: object, // Prosemirror editorState object
    transaction: object, // Most recent ProseMirror transaction
    containerId: string, // unique ID of the Editor container
    pluginKey: object, // Prosemirror PluginKey object for this Addon
}
```

#### ProseMirror Plugin System
Addons can take advantage of [ProseMirror's Plugin System](https://prosemirror.net/docs/ref/#state.Plugin_System) by including a plugin name: `static PluginName = 'string';` and getPlugins function: `static getPlugins() { }` as static variables on the addon component. For example: 

```javascript
import React, { Component } from 'react';
import { Plugin } from 'prosemirror-state';

class NewAddon extends Component {
    static pluginName = 'newAddonPlugin';
    static getPlugins({ pluginKey, isReadOnly }) {
        return [new Plugin({
            key: pluginKey,
            view: function() { }
        })];
    }

    render() {
        return <div>Hello</div>
    }
}
```
The `getPlugins` function is passed the pluginKey (which can be used to access the plugin - see [ProseMirror docs](https://prosemirror.net/docs/ref/#state.PluginKey)) and the Editor's isReadOnly prop, in addition to any original props passed to the addon component when instantiated.

#### ProseMirror NodeView 
Addons can take advantage of [ProseMirror's NodeView interface](https://prosemirror.net/docs/ref/#view.NodeView) to create custom editable elements inside the document. Addons are able to add a schema element to the [ProseMirror schema](https://prosemirror.net/docs/ref/#model.Schema) that will render as a React component of your design.

To do so, specify a `static schema() {}` function in your addon component that returns a ProseMirror schema element. This custom schema element must have two additional functions to enable React rendering: `toEditable` and `toStatic`. These functions should return the React component that should be rendered inside the document in editing and read-only mode, respectively. For example: 

```javascript
import React, { Component } from 'react';
import { Plugin } from 'prosemirror-state';

class NewAddon extends Component {
    static schema(props) {
        return {
            nodes: {
                mySchemaItem: {
                    atom: true,
                    group: 'inline',
                    attrs: {
                        value: { default: '' },
                        count: { default: 0 },
                    },
                    inline: true,
                    draggable: false,
                    selectable: true,
                    insertMenu: {
                        label: 'MySchemaItem',
                        icon: 'pt-icon-asterisk',
                        onInsert: (view) => {
                            const newNode = view.state.schema.nodes.mySchemaItem.create();
                            view.dispatch(view.state.tr.replaceSelectionWith(newNode));
                        },
                    },
                    toEditable(node, view, decorations, isSelected, helperFunctions) {
                        return (
                            <EditableComponent
                                value={node.attrs.value}
                                count={node.attrs.count}
                                isSelected={isSelected}
                                view={view}
                                {...helperFunctions}
                            />
                        );
                    },
                    toStatic(node) {
                        return (
                            <StaticComponent
                                value={node.attrs.value}
                                count={node.attrs.count}
                            />
                        );
                    },
                },
            }
        }
    }

    render() {
        return <div>Hello</div>
    }
}
```
The `schema()` functions is passed the original props given to the instantiated addon component. Review the documentation for [ProseMirror Schema Nodes](https://prosemirror.net/docs/ref/#model.NodeType) and [ProseMirror Schema Marks](https://prosemirror.net/docs/ref/#model.MarkType) for the full list of default configuration parameters.

Note, that because the schema is interpretted and created at the creation of the Editor component, updating the props passed to the addon component will not update the props passed to the toEditable and toStatic components. The schema() function is called only once, and therefore lives outside the normal React lifecycle.

If using the `InsertMenu` addon, an insertMenu object can be defined in the schema object to populate the insert menu with the new addon.

The `toEditable` and `toStatic` functions are passed the following parameters: 

```javascript
{
    node: object, // the ProseMirror node of this instance of the addon
    view: object, // the curent ProseMirror view
    decorations: object, // the current ProseMirror decorations
    isSelected: boolean, // whether the node is currently selected or not
    helperFunctions: object, // an object with the following functions that can be helpful when interacting with ProseMirror: updateAttrs, changeNode, updateContent, getPos
}
```

### Menus

- Make note that menu buttons should use
```
onMouseDown={(evt)=> {
    evt.preventDefault();
}}
```