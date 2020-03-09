const builder = require('electron-builder');

builder.build({
    config: {
        'appId': 'VRC-Misc',
        'win':{
            'icon': 'icon_pre.ico',
            'target': {
                'target': 'zip',
                'arch': [
                    'x64'
                ]
            }
        }
    }
});