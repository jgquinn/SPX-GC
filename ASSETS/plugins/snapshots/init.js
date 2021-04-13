import * as UI from '../lib/ui.js';

import './jspdf.umd.min.js';


function PluginInstance() {
    var pluginRootFolder = '/plugins/snapshots/'
    var plug = this;

    this.doc = null;
    this.docPages = 0;

    this.render = () => {
        console.log( 'PLUGIN snapshots appending to dom...' );

        this.btnStart = UI.button( {
            description: 'Start taking snapshots',
            caption: 'Start Snapshots',
            color: 'green'
        } );
        this.btnStart.querySelector( '#btn' ).addEventListener( 'click', plug.startDoc );

        this.btnCancel = UI.button( {
            description: 'Stop taking snapshots',
            caption: 'Cancel Snapshots',
            color: 'red'
        } );
        this.btnCancel.querySelector( '#btn' ).addEventListener( 'click', plug.cancelSnap );
        disableButton( this.btnCancel, true );

        this.btnAdd = UI.button( {
            description: 'Add snapshot frame',
            caption: 'Add Snapshot',
            color: 'blue'
        } );
        this.btnAdd.querySelector( '#btn' ).addEventListener( 'click', plug.addSnap );
        disableButton( this.btnAdd, true );

        this.btnSave = UI.button( {
            description: 'Save snapshots',
            caption: 'Save Snapshot',
            color: 'green'
        } );
        this.btnSave.querySelector( '#btn' ).addEventListener( 'click', plug.saveDoc );
        disableButton( this.btnSave, true );

        var app = document.getElementById( 'controllerPluginButtons' );
        app.appendChild( this.btnStart );
        app.appendChild( this.btnCancel );
        app.appendChild( this.btnAdd );
        app.appendChild( this.btnSave );
    }

    this.startDoc = () => {
        disableButton( this.btnStart, true );
        fetch( '/export-snapshot/ready?dt=' + Date.now() ).then( () => {
            disableButton( this.btnCancel, false );
            disableButton( this.btnAdd, false );
            disableButton( this.btnSave, true );
        } ).catch( ( err ) => {
            disableButton( this.btnStart, false );
            console.log( err );
        } );

        this.doc = new jspdf.jsPDF( {
            orientation: 'landscape',
            unit: 'pt',
            format: [ 1920, 1080 ],
            compress: true
        } );
        this.docPages = 0;
    }

    this.cancelDoc = () => {
        this.doc = null;
        this.docPages = 0;

        disableButton( this.btnStart, false );
        disableButton( this.btnCancel, true );
        disableButton( this.btnAdd, true );
        disableButton( this.btnSave, true );
    }

    this.addSnap = () => {
        console.log( 'PLUGIN snapshots requesting still frame' );
        let img = new Image();
        img.onload = () => {
            if ( this.docPages>0 ) {
                this.doc.addPage( [ 1920, 1080 ], 'landscape' );
            }
            this.doc.addImage(
                img,
                'PNG',
                0, 0,
                1920, 1080 );
            this.docPages += 1;
            console.log( 'PLUGIN snapshots added still frame; now have pages: ' + this.docPages );
            disableButton( this.btnAdd, false );
            disableButton( this.btnSave, false );
        };
        disableButton( this.btnAdd, true );
        disableButton( this.btnSave, true );
        img.src = '/export-snapshot?dt=' + Date.now();
    }

    this.saveDoc = () => {
        if ( this.doc != null ) {
            this.doc.save( 'snapshots.pdf' );
            this.cancelDoc();
        }
    }
}

function disableButton( uibtn, disabled ) {
    let btn = uibtn.querySelector( '#btn' );
    btn.disabled = disabled;
    if ( disabled ) {
        btn.style.opacity = 0.5;
    } else {
        btn.style.opacity = 1;
    }
}

var plugin = plugin || new PluginInstance;
plugin.render();
