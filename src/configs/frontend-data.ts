let conf;
if (localStorage.getItem('initial')) {
    conf = JSON.parse(localStorage.getItem('initial'));

} else {

    conf = {
        nClients: 15,
        requestsLimit: 13,
        requestTimeLimit: 10,
        servers: [
            {
                name: 'Master',
                isMaster: true
            },
            {
                name: 'Slave1',
                maxRegions: 3,
                distanceToMasterKm: 2500,
                hdd: 100
            },
            {
                name: 'Slave2',
                maxRegions: 5,
                distanceToMasterKm: 100,
                hdd: 200
            },
            {
                name: 'Slave3',
                maxRegions: 3,
                distanceToMasterKm: 2500,
                hdd: 100
            },
            {
                name: 'Slave4',
                maxRegions: 2,
                distanceToMasterKm: 100,
                hdd: 200
            },
            {
                name: 'Slave6',
                maxRegions: 3,
                distanceToMasterKm: 0,
                hdd: 100
            },
            {
                name: 'Slave7',
                maxRegions: 100,
                distanceToMasterKm: 10000,
                hdd: 1000
            }
        ],
        tables: [
            {
                name: 'user',
                tableSize: 90,
                sharding: {
                    type: 'Вертикальный',
                    serverId: 'Slave2'
                },
                fields: [{
                    name: 'id',
                    type: 'Числовой',
                    isPrimary: true,
                }, {
                    name: 'name',
                    type: 'Строковый',
                    familyName: 'individual'
                }, {
                    name: 'email',
                    type: 'Строковый',
                    familyName: 'contacts'
                }, {
                    name: 'year',
                    type: 'Числовой',
                    familyName: 'individual'
                }, {
                    name: 'tel',
                    type: 'Строковый',
                    familyName: 'contacts'
                }, {
                    name: 'pass',
                    type: 'Строковый',
                    familyName: 'security'
                }, {
                    name: 'salt',
                    type: 'Строковый',
                    familyName: 'security'
                }, {
                    name: 'addr',
                    type: 'Строковый',
                    familyName: 'contacts'
                }, {
                    name: 'payment',
                    type: 'Числовой',
                    familyName: ''
                }]
            },
            {
                name: 'session',
                tableSize: 100,
                // sharding: {
                //     type: 'Горизонтальный',
                //     fieldName: 'id'
                // },
                sharding: {},
                fields: [{
                    name: 'id',
                    type: 'Числовой',
                    isPrimary: true
                }, {
                    name: 'created_at',
                    type: 'Числовой',
                    familyName: 'time'
                }, {
                    name: 'expired_at',
                    type: 'Числовой',
                    familyName: 'time'
                }, {
                    name: 'user_id',
                    type: 'Числовой',
                    familyName: 'user_data'
                }, {
                    name: 'uuid',
                    type: 'Числовой',
                    familyName: ''
                }, {
                    name: 'status',
                    type: 'Строковый',
                    familyName: 'user_data'
                }]
            },
            {
                name: 'playlist',
                tableSize: 30,
                // sharding: {
                //     type: 'Горизонтальный',
                //     fieldName: 'id'
                // },
                sharding: {},
                fields: [{
                    name: 'id',
                    type: 'Числовой',
                    isPrimary: true
                }, {
                    name: 'name',
                    type: 'Строковый',
                    familyName: 'details'
                }, {
                    name: 'is_archived',
                    type: 'Числовой',
                    length: 1,
                    familyName: ''
                }, {
                    name: 'is_favourite',
                    type: 'Числовой',
                    length: 1,
                    familyName: 'favs'
                }, {
                    name: 'favourite_title',
                    type: 'Строковый',
                    familyName: 'favs'
                }, {
                    name: 'description',
                    type: 'Строковый',
                    familyName: 'details'
                }]
            }
        ],
        sqls: [
            {
                "from": [
                    "user"
                ],
                "select": [
                    "user.name",
                    "user.email"
                ],
                "where": "user.name = 'abc'",
                "raw": "SELECT name, year FROM user"
            },
            // {
            //     "from": [
            //         "user"
            //     ],
            //     "select": [
            //         "user.name",
            //         "user.year"
            //     ],
            //     "raw": "SELECT name, year FROM user"
            // },
            // {
            //     "from": [
            //         "user"
            //     ],
            //     "select": [
            //         "user.name",
            //         "user.year"
            //     ],
            //     "where": "user.name = 'abc'",
            //     "raw": "SELECT name, year FROM user AS u WHERE u.name = 'abc'"
            // },
            // {
            //     "from": [
            //         "user"
            //     ],
            //     "select": [
            //         "user.name",
            //         "user.year"
            //     ],
            //     "where": "user.name = 'abc' OR user.email = 'abc'",
            //     "raw": "SELECT name, year FROM user AS u WHERE u.name = 'abc' OR u.email = 'abc'"
            // },
            // {
            //     "from": [
            //         "user"
            //     ],
            //     "select": [
            //         "user.name",
            //         "user.year"
            //     ],
            //     "where": "user.name = 'abc' OR user.tel = 9",
            //     "raw": "SELECT name, year FROM user AS u WHERE u.name = 'abc' OR u.tel = 9"
            // },
            // {
            //     "from": [
            //         "user"
            //     ],
            //     "select": [
            //         "*"
            //     ],
            //     "where": "user.name = 'abc'",
            //     "raw": "SELECT * FROM user AS u WHERE u.name = 'abc'"
            // },
            // {
            //     "from": [
            //         "session"
            //     ],
            //     "select": [
            //         "*"
            //     ],
            //     "where": "session.created_at > 1491923854",
            //     "raw": "SELECT * FROM session AS s WHERE s.created_at > 1491923854"
            // },
            // {
            //     "from": [
            //         "session"
            //     ],
            //     "select": [
            //         "session.user_id"
            //     ],
            //     "where": "session.status = 'abc'",
            //     "raw": "SELECT user_id FROM session AS s WHERE status = 'abc'"
            // },
            // {
            //     "from": [
            //         "session"
            //     ],
            //     "select": [
            //         "session.status",
            //         "session.user_id"
            //     ],
            //     "where": "session.expired_at = 9",
            //     "raw": "SELECT status, user_id FROM session AS s WHERE s.expired_at = 9"
            // },
            // {
            //     "from": [
            //         "playlist"
            //     ],
            //     "select": [
            //         "playlist.favourite_title"
            //     ],
            //     "where": "playlist.isFavourite = 1",
            //     "raw": "SELECT favourite_title FROM playlist AS p WHERE p.isFavourite = 1"
            // },
            {
                "from": [
                    "playlist"
                ],
                "select": [
                    "*"
                ],
                "where": "playlist.created_at > 1491923854",
                "raw": "SELECT * FROM playlist AS p WHERE p.created_at > 1491923854"
            },
            // {
            //     "from": [
            //         "playlist"
            //     ],
            //     "select": [
            //         "playlist.name",
            //         "playlist.description"
            //     ],
            //     "where": "playlist.created_at > 1",
            //     "raw": "SELECT name, description FROM playlist AS p WHERE p.created_at > 1"
            // },
            // {
            //     "from": [
            //         "playlist"
            //     ],
            //     "select": [
            //         "playlist.name",
            //         "playlist.description"
            //     ],
            //     "where": "playlist.name IN ('abc','bca','ccc')",
            //     "raw": "SELECT name, description FROM playlist AS p WHERE p.name IN ('abc', 'bca', 'ccc')"
            // }
        ],
        sqlsRaw: (`
SELECT name, year FROM user;
SELECT name, year FROM user AS u WHERE u.name = 'abc';
SELECT name, year FROM user AS u WHERE u.name = 'abc' OR u.email = 'abc';
SELECT name, year FROM user AS u WHERE u.name = 'abc' OR u.tel = 9;
SELECT * FROM user AS u WHERE u.name = 'abc';

SELECT * FROM session AS s WHERE s.created_at > 8;
SELECT user_id FROM session AS s WHERE status = 'abc';
SELECT status, user_id FROM session AS s WHERE s.expired_at = 9;

SELECT favourite_title FROM playlist AS p WHERE p.isFavourite = 1;
SELECT * FROM playlist AS p WHERE p.created_at < 4 AND p.created_at > 2;
SELECT name, description FROM playlist AS p WHERE p.created_at > 1;
SELECT name, description FROM playlist AS p WHERE p.name IN ('abc', 'bca', 'ccc');
`.trim()
        )
    }
}

export default conf;