# PubPub Editor

A stand alone, extensible WSIWYG editor based on [ProseMirror](https://prosemirror.net/). 

## Usage

```bash
npm install @pubpub/editor
```
```javascript
import Editor from '@pubpub/editor';

const component = (props)=> {
    return ( 
        <Editor
            /* customNodes: Object of custom nodes. To remove default node, override. For example, { image: null, header: null } */
            customNodes={{}}
            /* customMarks: Object of custom marks. To remove default mark, override. For example, { strong: null } */
            customMarks={{}}
            /* An object of custom plugins, with key=pluginName and value=function. All customPlugins values should be a function, which is passed schema and props - and returns a Plugin or array of Plugins */
            customPlugins={{}}
            /* An object with nodeName keys and values of objects of overriding options. For example: nodeOptions = { image: { linkToSrc: false } } */
            nodeOptions={{}}   
            /* An object with needed collaborative properties */   
            collaborativeOptions={{}}
            /* A function that will be called on every editor change (cursor and content). Passes up an editorChangeObject which is useful for building the interfaces around the editor. Also fired on editor initialization. */
            onChange={()=>{}}
            /* A editor JSON document. */
            initialContent={{}}
            /* A string to show when the editor is empty. */
            placeholder=""
            /* A boolean that will prevent edits to the document when true. */
            isReadOnly={false}
            /* An array of highlights to be shown with the highlights plugin */
            highlights={[]}
            /* A function for finding highlight content when pasted. Used by the highlightQuote plugin */
            getHighlightContent={()=>{}}
        />
    );
}
```

### onChange changeObject
```javascript
{
    /* The current editor view. */
    view: {},
    /* The active selection. */
    selection: {},
    /* The bounding box for the active selection. */
    selectionBoundingBox: {},
    /* The text, prefix, and suffix of the current selection */
    selectedText: {},
    /* If the active selection is of a NodeView, provide the selected node. */
    selectedNode: {},
    /* If the active selection is of a NodeView, provide a function to update the selected node. */
    /* The updateNode function expects an object of attrs as its sole input */
    updateNode: (attrs)=>{},
    /* If the active selection is of a NodeView, provide a function to change the selected node. */
    changeNode: (nodeType, attrs, content)=>{},
    /* The full list of available node insert functions. */
    /* Each insert function expect an object of attrs as */
    /* its sole input. */
    insertFunctions: {},
    /* The full list of menu items, their status, and their click handler. */
    menuItems: [],
    /* The full list of decorations and their bounding boxes */
    decorations: [],
    /* The list of shortcut keys and the text following them. */
    /* Useful for inline insert menus and autocompletes. */
    shortcutValues: {},
    /* activeLink is useful for displaying a link editing interface. */
    activeLink: {},
}
```


## Development

### To Install and run Storybook
```bash
npm install
npm start
```

### Menus
Menus for this editor are to be built by whatever external tool is wrapping the <Editor /> component.

Menu buttons should use the following to prevent focus loss:
```javascript
onMouseDown={(evt)=> {
    evt.preventDefault();
}}
```
