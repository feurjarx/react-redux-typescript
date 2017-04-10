export default {
    // dbSize: 1000,
    tables: [
        // {
        //     name: 'user',
        //     tableSize: 90,
        //     // sharding: {
        //     //     type: 'Вертикальный',
        //     //     serverId: 'server_B'
        //     // },
        //     fields: [{
        //         name: 'id',
        //         type: 'Числовой',
        //         isPrimary: true,
        //     }, {
        //         name: 'name',
        //         type: 'Строковый',
        //         indexed: true,
        //         familyName: 'permanent'
        //     }, {
        //         name: 'email',
        //         type: 'Строковый',
        //         indexed: true,
        //         familyName: 'contacts'
        //     }, {
        //         name: 'year',
        //         type: 'Числовой',
        //         indexed: true,
        //         familyName: 'permanent'
        //     }, {
        //         name: 'pass',
        //         type: 'Строковый',
        //         familyName: '...'
        //     }, {
        //         name: 'tel',
        //         type: 'Строковый',
        //         familyName: 'contacts'
        //     }, {
        //         name: 'created_at',
        //         type: 'Числовой',
        //         familyName: 'permanent'
        //     }]
        // },
        {
            name: 'session',
            tableSize: 100,
            sharding: {
                type: 'Горизонтальный',
                fieldId: 'id'
            },
            fields: [{
                name: 'id',
                type: 'Числовой',
                isPrimary: true
            }, {
                name: 'created_at',
                type: 'Числовой',
                length: 11,
                indexed: true,
                familyName: 'time'
            }, {
                name: 'status',
                type: 'Строковый',
                indexed: true,
                familyName: '...'
            }]
        },
        // {
        //     name: 'playlist',
        //     tableSize: 30,
        //     fields: [{
        //         name: 'id',
        //         type: 'Числовой',
        //         isPrimary: true
        //     }, {
        //         name: 'created_at',
        //         type: 'Числовой',
        //         length: 11,
        //         indexed: true,
        //         familyName: 'time'
        //     }, {
        //         name: 'user_id',
        //         type: 'Числовой',
        //         indexed: true,
        //         familyName: '...'
        //     }, {
        //         name: 'description',
        //         type: 'Строковый',
        //         familyName: 'music'
        //     }, {
        //         name: 'quality',
        //         type: 'Числовой',
        //         familyName: 'music'
        //     }]
        // }
    ],
    servers: [
        {
            name: 'server_A',
            maxRegions: 5,
            isMaster: true
        },
        // {
        //     name: 'server_B',
        //     maxRegions: 3,
        //     hdd: 100
        // },
        {
            name: 'server_C',
            maxRegions: 5,
            hdd: 300
        },
        // {
        //     name: 'server_D',
        //     maxRegions: 10,
        //     hdd: 500
        // },
        // {
        //     name: 'server_E',
        //     maxRegions: 2,
        //     hdd: 200
        // },
        {
            name: 'server_F',
            maxRegions: 10,
            hdd: 100
        },
        {
        name: 'server_G',
            maxRegions: 6,
            hdd: 100
        }
    ]
}