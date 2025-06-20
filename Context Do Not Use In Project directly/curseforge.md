Javascript
const headers = {
  'Accept':'application/json',
  'x-api-key':'API_KEY'
};

fetch('/v1/games',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

GET /v1/games

Get all games that are available to the provided API key.

Parameters
Name	In	Type	Required	Description
index	query	integer(int32)	false	A zero based index of the first item to include in the response, the limit is: (index + pageSize <= 10,000).
pageSize	query	integer(int32)	false	The number of items to include in the response, the default/maximum value is 50.
Example responses

200 Response

{
  "data": [
    {
      "id": 0,
      "name": "string",
      "slug": "string",
      "dateModified": "2019-08-24T14:15:22Z",
      "assets": {
        "iconUrl": "string",
        "tileUrl": "string",
        "coverUrl": "string"
      },
      "status": 1,
      "apiStatus": 1
    }
  ],
  "pagination": {
    "index": 0,
    "pageSize": 0,
    "resultCount": 0,
    "totalCount": 0
  }
}
Responses
Status	Meaning	Description	Schema
200	OK	none	Get Games Response
500	Internal Server Error	none	None
To perform this operation, you must be authenticated by means of one of the following methods: API_KEY
Get Game

Code samples


const headers = {
  'Accept':'application/json',
  'x-api-key':'API_KEY'
};

fetch('/v1/games/{gameId}',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

GET /v1/games/{gameId}

Get a single game. A private game is only accessible by its respective API key.

Parameters
Name	In	Type	Required	Description
gameId	path	integer(int32)	true	A game unique id
Example responses

200 Response

{
  "data": {
    "id": 0,
    "name": "string",
    "slug": "string",
    "dateModified": "2019-08-24T14:15:22Z",
    "assets": {
      "iconUrl": "string",
      "tileUrl": "string",
      "coverUrl": "string"
    },
    "status": 1,
    "apiStatus": 1
  }
}
Responses
Status	Meaning	Description	Schema
200	OK	none	Get Game Response
404	Not Found	none	None
500	Internal Server Error	none	None
To perform this operation, you must be authenticated by means of one of the following methods: API_KEY
Get Versions

Code samples


const headers = {
  'Accept':'application/json',
  'x-api-key':'API_KEY'
};

fetch('/v1/games/{gameId}/versions',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

GET /v1/games/{gameId}/versions

Get all available versions for each known version type of the specified game. A private game is only accessible to its respective API key.

Parameters
Name	In	Type	Required	Description
gameId	path	integer(int32)	true	A game unique id
Example responses

200 Response

{
  "data": [
    {
      "type": 0,
      "versions": [
        "string"
      ]
    }
  ]
}
Responses
Status	Meaning	Description	Schema
200	OK	none	Get Versions Response - V1
404	Not Found	none	None
500	Internal Server Error	none	None
To perform this operation, you must be authenticated by means of one of the following methods: API_KEY
Get Version Types

Code samples


const headers = {
  'Accept':'application/json',
  'x-api-key':'API_KEY'
};

fetch('/v1/games/{gameId}/version-types',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

GET /v1/games/{gameId}/version-types

Get all available version types of the specified game.

A private game is only accessible to its respective API key.

Currently, when creating games via the CurseForge for Studios Console, you are limited to a single game version type. This means that this endpoint is probably not useful in most cases and is relevant mostly when handling existing games that have multiple game versions such as World of Warcraft and Minecraft (e.g. 517 for wow_retail).

Parameters
Name	In	Type	Required	Description
gameId	path	integer(int32)	true	A game unique id
Example responses

200 Response

{
  "data": [
    {
      "id": 0,
      "gameId": 0,
      "name": "string",
      "slug": "string",
      "isSyncable": true,
      "status": 1
    }
  ]
}
Responses
Status	Meaning	Description	Schema
200	OK	none	Get Version Types Response
404	Not Found	none	None
500	Internal Server Error	none	None
To perform this operation, you must be authenticated by means of one of the following methods: API_KEY
Get Versions - V2

Code samples


const headers = {
  'Accept':'application/json',
  'x-api-key':'API_KEY'
};

fetch('/v2/games/{gameId}/versions',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

GET /v2/games/{gameId}/versions

Get all available versions for each known version type of the specified game. A private game is only accessible to its respective API key.

Parameters
Name	In	Type	Required	Description
gameId	path	integer(int32)	true	A game unique id
Example responses

200 Response

{
  "data": [
    {
      "type": 0,
      "versions": [
        {
          "id": 0,
          "slug": "string",
          "name": "string"
        }
      ]
    }
  ]
}
Responses
Status	Meaning	Description	Schema
200	OK	none	Get Versions Response - V2
404	Not Found	none	None
500	Internal Server Error	none	None
To perform this operation, you must be authenticated by means of one of the following methods: API_KEY
Categories
Get Categories

Code samples


const headers = {
  'Accept':'application/json',
  'x-api-key':'API_KEY'
};

fetch('/v1/categories?gameId=0',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

GET /v1/categories

Get all available classes and categories of the specified game. Specify a game id for a list of all game categories, or a class id for a list of categories under that class. specifiy the classes Only flag to just get the classes for a given game.

Parameters
Name	In	Type	Required	Description
gameId	query	integer(int32)	true	A game unique id
classId	query	integer(int32)	false	A class unique id
classesOnly	query	boolean	false	A flag used with gameId to return only classes
Example responses

200 Response

{
  "data": [
    {
      "id": 0,
      "gameId": 0,
      "name": "string",
      "slug": "string",
      "url": "string",
      "iconUrl": "string",
      "dateModified": "2019-08-24T14:15:22Z",
      "isClass": true,
      "classId": 0,
      "parentCategoryId": 0,
      "displayIndex": 0
    }
  ]
}
Responses
Status	Meaning	Description	Schema
200	OK	none	Get Categories Response
404	Not Found	none	None
500	Internal Server Error	none	None
To perform this operation, you must be authenticated by means of one of the following methods: API_KEY
Mods
Search Mods

Code samples


const headers = {
  'Accept':'application/json',
  'x-api-key':'API_KEY'
};

fetch('/v1/mods/search?gameId=0',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

GET /v1/mods/search

Get all mods that match the search criteria.

Parameters
Name	In	Type	Required	Description
gameId	query	integer(int32)	true	Filter by game id.
classId	query	integer(int32)	false	Filter by section id (discoverable via Categories)
categoryId	query	integer(int32)	false	Filter by category id
categoryIds	query	string	false	Filter by a list of category ids - this will override categoryId
gameVersion	query	string	false	Filter by game version string
gameVersions	query	string	false	Filter by a list of game version strings - this will override
searchFilter	query	string	false	Filter by free text search in the mod name and author
sortField	query	ModsSearchSortField	false	Filter by ModsSearchSortField enumeration
sortOrder	query	SortOrder	false	'asc' if sort is in ascending order, 'desc' if sort is in descending order
modLoaderType	query	ModLoaderType	false	Filter only mods associated to a given modloader (Forge, Fabric ...). Must be coupled with gameVersion.
modLoaderTypes	query	string	false	Filter by a list of mod loader types - this will override modLoaderType
gameVersionTypeId	query	integer(int32)	false	Filter only mods that contain files tagged with versions of the given gameVersionTypeId
authorId	query	integer(int32)	false	Filter only mods that the given authorId is a member of.
primaryAuthorId	query	integer(int32)	false	Filter only mods that the given primaryAuthorId is the owner of.
slug	query	string	false	Filter by slug (coupled with classId will result in a unique result).
index	query	integer(int32)	false	A zero based index of the first item to include in the response, the limit is: (index + pageSize <= 10,000).
pageSize	query	integer(int32)	false	The number of items to include in the response, the default/maximum value is 50.
Detailed descriptions
categoryIds: Filter by a list of category ids - this will override categoryId categoryIds=[1,2,3...]

The maximum allowed category ids per query is 10

gameVersions: Filter by a list of game version strings - this will override gameVersion

gameVersions=["1.19.1", "1.19.2", "1.20.1" ...]

The maximum allowed category ids per query is 4

modLoaderTypes: Filter by a list of mod loader types - this will override modLoaderType modLoaderTypes=[Forge, Fabric, ...]

Max values = 5

Enumerated Values
Parameter	Value
sortField	1
sortField	2
sortField	3
sortField	4
sortField	5
sortField	6
sortField	7
sortField	8
sortField	9
sortField	10
sortField	11
sortField	12
sortOrder	asc
sortOrder	desc
modLoaderType	0
modLoaderType	1
modLoaderType	2
modLoaderType	3
modLoaderType	4
modLoaderType	5
modLoaderType	6
Example responses

200 Response

{
  "data": [
    {
      "id": 0,
      "gameId": 0,
      "name": "string",
      "slug": "string",
      "links": {
        "websiteUrl": "string",
        "wikiUrl": "string",
        "issuesUrl": "string",
        "sourceUrl": "string"
      },
      "summary": "string",
      "status": 1,
      "downloadCount": 0,
      "isFeatured": true,
      "primaryCategoryId": 0,
      "categories": [
        {
          "id": 0,
          "gameId": 0,
          "name": "string",
          "slug": "string",
          "url": "string",
          "iconUrl": "string",
          "dateModified": "2019-08-24T14:15:22Z",
          "isClass": true,
          "classId": 0,
          "parentCategoryId": 0,
          "displayIndex": 0
        }
      ],
      "classId": 0,
      "authors": [
        {
          "id": 0,
          "name": "string",
          "url": "string"
        }
      ],
      "logo": {
        "id": 0,
        "modId": 0,
        "title": "string",
        "description": "string",
        "thumbnailUrl": "string",
        "url": "string"
      },
      "screenshots": [
        {
          "id": 0,
          "modId": 0,
          "title": "string",
          "description": "string",
          "thumbnailUrl": "string",
          "url": "string"
        }
      ],
      "mainFileId": 0,
      "latestFiles": [
        {
          "id": 0,
          "gameId": 0,
          "modId": 0,
          "isAvailable": true,
          "displayName": "string",
          "fileName": "string",
          "releaseType": 1,
          "fileStatus": 1,
          "hashes": [
            {
              "value": "string",
              "algo": 1
            }
          ],
          "fileDate": "2019-08-24T14:15:22Z",
          "fileLength": 0,
          "downloadCount": 0,
          "fileSizeOnDisk": 0,
          "downloadUrl": "string",
          "gameVersions": [
            "string"
          ],
          "sortableGameVersions": [
            {
              "gameVersionName": "string",
              "gameVersionPadded": "string",
              "gameVersion": "string",
              "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
              "gameVersionTypeId": 0
            }
          ],
          "dependencies": [
            {
              "modId": 0,
              "relationType": 1
            }
          ],
          "exposeAsAlternative": true,
          "parentProjectFileId": 0,
          "alternateFileId": 0,
          "isServerPack": true,
          "serverPackFileId": 0,
          "isEarlyAccessContent": true,
          "earlyAccessEndDate": "2019-08-24T14:15:22Z",
          "fileFingerprint": 0,
          "modules": [
            {
              "name": "string",
              "fingerprint": 0
            }
          ]
        }
      ],
      "latestFilesIndexes": [
        {
          "gameVersion": "string",
          "fileId": 0,
          "filename": "string",
          "releaseType": 1,
          "gameVersionTypeId": 0,
          "modLoader": 0
        }
      ],
      "latestEarlyAccessFilesIndexes": [
        {
          "gameVersion": "string",
          "fileId": 0,
          "filename": "string",
          "releaseType": 1,
          "gameVersionTypeId": 0,
          "modLoader": 0
        }
      ],
      "dateCreated": "2019-08-24T14:15:22Z",
      "dateModified": "2019-08-24T14:15:22Z",
      "dateReleased": "2019-08-24T14:15:22Z",
      "allowModDistribution": true,
      "gamePopularityRank": 0,
      "isAvailable": true,
      "thumbsUpCount": 0,
      "rating": 0
    }
  ],
  "pagination": {
    "index": 0,
    "pageSize": 0,
    "resultCount": 0,
    "totalCount": 0
  }
}
Responses
Status	Meaning	Description	Schema
200	OK	none	Search Mods Response
400	Bad Request	none	None
500	Internal Server Error	none	None
To perform this operation, you must be authenticated by means of one of the following methods: API_KEY
Get Mod

Code samples


const headers = {
  'Accept':'application/json',
  'x-api-key':'API_KEY'
};

fetch('/v1/mods/{modId}',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

GET /v1/mods/{modId}

Get a single mod.

Parameters
Name	In	Type	Required	Description
modId	path	integer(int32)	true	The mod id
Example responses

200 Response

{
  "data": {
    "id": 0,
    "gameId": 0,
    "name": "string",
    "slug": "string",
    "links": {
      "websiteUrl": "string",
      "wikiUrl": "string",
      "issuesUrl": "string",
      "sourceUrl": "string"
    },
    "summary": "string",
    "status": 1,
    "downloadCount": 0,
    "isFeatured": true,
    "primaryCategoryId": 0,
    "categories": [
      {
        "id": 0,
        "gameId": 0,
        "name": "string",
        "slug": "string",
        "url": "string",
        "iconUrl": "string",
        "dateModified": "2019-08-24T14:15:22Z",
        "isClass": true,
        "classId": 0,
        "parentCategoryId": 0,
        "displayIndex": 0
      }
    ],
    "classId": 0,
    "authors": [
      {
        "id": 0,
        "name": "string",
        "url": "string"
      }
    ],
    "logo": {
      "id": 0,
      "modId": 0,
      "title": "string",
      "description": "string",
      "thumbnailUrl": "string",
      "url": "string"
    },
    "screenshots": [
      {
        "id": 0,
        "modId": 0,
        "title": "string",
        "description": "string",
        "thumbnailUrl": "string",
        "url": "string"
      }
    ],
    "mainFileId": 0,
    "latestFiles": [
      {
        "id": 0,
        "gameId": 0,
        "modId": 0,
        "isAvailable": true,
        "displayName": "string",
        "fileName": "string",
        "releaseType": 1,
        "fileStatus": 1,
        "hashes": [
          {
            "value": "string",
            "algo": 1
          }
        ],
        "fileDate": "2019-08-24T14:15:22Z",
        "fileLength": 0,
        "downloadCount": 0,
        "fileSizeOnDisk": 0,
        "downloadUrl": "string",
        "gameVersions": [
          "string"
        ],
        "sortableGameVersions": [
          {
            "gameVersionName": "string",
            "gameVersionPadded": "string",
            "gameVersion": "string",
            "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
            "gameVersionTypeId": 0
          }
        ],
        "dependencies": [
          {
            "modId": 0,
            "relationType": 1
          }
        ],
        "exposeAsAlternative": true,
        "parentProjectFileId": 0,
        "alternateFileId": 0,
        "isServerPack": true,
        "serverPackFileId": 0,
        "isEarlyAccessContent": true,
        "earlyAccessEndDate": "2019-08-24T14:15:22Z",
        "fileFingerprint": 0,
        "modules": [
          {
            "name": "string",
            "fingerprint": 0
          }
        ]
      }
    ],
    "latestFilesIndexes": [
      {
        "gameVersion": "string",
        "fileId": 0,
        "filename": "string",
        "releaseType": 1,
        "gameVersionTypeId": 0,
        "modLoader": 0
      }
    ],
    "latestEarlyAccessFilesIndexes": [
      {
        "gameVersion": "string",
        "fileId": 0,
        "filename": "string",
        "releaseType": 1,
        "gameVersionTypeId": 0,
        "modLoader": 0
      }
    ],
    "dateCreated": "2019-08-24T14:15:22Z",
    "dateModified": "2019-08-24T14:15:22Z",
    "dateReleased": "2019-08-24T14:15:22Z",
    "allowModDistribution": true,
    "gamePopularityRank": 0,
    "isAvailable": true,
    "thumbsUpCount": 0,
    "rating": 0
  }
}
Responses
Status	Meaning	Description	Schema
200	OK	none	Get Mod Response
404	Not Found	none	None
500	Internal Server Error	none	None
To perform this operation, you must be authenticated by means of one of the following methods: API_KEY
Get Mods

Code samples

const inputBody = '{
  "modIds": [
    0
  ],
  "filterPcOnly": true
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'x-api-key':'API_KEY'
};

fetch('/v1/mods',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

POST /v1/mods

Get a list of mods belonging the the same game.

Body parameter

{
  "modIds": [
    0
  ],
  "filterPcOnly": true
}
Parameters
Name	In	Type	Required	Description
body	body	GetModsByIdsListRequestBody	true	Request body containing an array of mod ids, mod ids must belong to the same game.
Example responses

200 Response

{
  "data": [
    {
      "id": 0,
      "gameId": 0,
      "name": "string",
      "slug": "string",
      "links": {
        "websiteUrl": "string",
        "wikiUrl": "string",
        "issuesUrl": "string",
        "sourceUrl": "string"
      },
      "summary": "string",
      "status": 1,
      "downloadCount": 0,
      "isFeatured": true,
      "primaryCategoryId": 0,
      "categories": [
        {
          "id": 0,
          "gameId": 0,
          "name": "string",
          "slug": "string",
          "url": "string",
          "iconUrl": "string",
          "dateModified": "2019-08-24T14:15:22Z",
          "isClass": true,
          "classId": 0,
          "parentCategoryId": 0,
          "displayIndex": 0
        }
      ],
      "classId": 0,
      "authors": [
        {
          "id": 0,
          "name": "string",
          "url": "string"
        }
      ],
      "logo": {
        "id": 0,
        "modId": 0,
        "title": "string",
        "description": "string",
        "thumbnailUrl": "string",
        "url": "string"
      },
      "screenshots": [
        {
          "id": 0,
          "modId": 0,
          "title": "string",
          "description": "string",
          "thumbnailUrl": "string",
          "url": "string"
        }
      ],
      "mainFileId": 0,
      "latestFiles": [
        {
          "id": 0,
          "gameId": 0,
          "modId": 0,
          "isAvailable": true,
          "displayName": "string",
          "fileName": "string",
          "releaseType": 1,
          "fileStatus": 1,
          "hashes": [
            {
              "value": "string",
              "algo": 1
            }
          ],
          "fileDate": "2019-08-24T14:15:22Z",
          "fileLength": 0,
          "downloadCount": 0,
          "fileSizeOnDisk": 0,
          "downloadUrl": "string",
          "gameVersions": [
            "string"
          ],
          "sortableGameVersions": [
            {
              "gameVersionName": "string",
              "gameVersionPadded": "string",
              "gameVersion": "string",
              "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
              "gameVersionTypeId": 0
            }
          ],
          "dependencies": [
            {
              "modId": 0,
              "relationType": 1
            }
          ],
          "exposeAsAlternative": true,
          "parentProjectFileId": 0,
          "alternateFileId": 0,
          "isServerPack": true,
          "serverPackFileId": 0,
          "isEarlyAccessContent": true,
          "earlyAccessEndDate": "2019-08-24T14:15:22Z",
          "fileFingerprint": 0,
          "modules": [
            {
              "name": "string",
              "fingerprint": 0
            }
          ]
        }
      ],
      "latestFilesIndexes": [
        {
          "gameVersion": "string",
          "fileId": 0,
          "filename": "string",
          "releaseType": 1,
          "gameVersionTypeId": 0,
          "modLoader": 0
        }
      ],
      "latestEarlyAccessFilesIndexes": [
        {
          "gameVersion": "string",
          "fileId": 0,
          "filename": "string",
          "releaseType": 1,
          "gameVersionTypeId": 0,
          "modLoader": 0
        }
      ],
      "dateCreated": "2019-08-24T14:15:22Z",
      "dateModified": "2019-08-24T14:15:22Z",
      "dateReleased": "2019-08-24T14:15:22Z",
      "allowModDistribution": true,
      "gamePopularityRank": 0,
      "isAvailable": true,
      "thumbsUpCount": 0,
      "rating": 0
    }
  ]
}
Responses
Status	Meaning	Description	Schema
200	OK	none	Get Mods Response
400	Bad Request	none	None
500	Internal Server Error	none	None
To perform this operation, you must be authenticated by means of one of the following methods: API_KEY
Get Featured Mods

Code samples

const inputBody = '{
  "gameId": 0,
  "excludedModIds": [
    0
  ],
  "gameVersionTypeId": 0
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'x-api-key':'API_KEY'
};

fetch('/v1/mods/featured',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

POST /v1/mods/featured

Get a list of featured, popular and recently updated mods.

Body parameter

{
  "gameId": 0,
  "excludedModIds": [
    0
  ],
  "gameVersionTypeId": 0
}
Parameters
Name	In	Type	Required	Description
body	body	GetFeaturedModsRequestBody	true	Match results for a game and exclude specific mods
Example responses

200 Response

{
  "data": {
    "featured": [
      {
        "id": 0,
        "gameId": 0,
        "name": "string",
        "slug": "string",
        "links": {
          "websiteUrl": "string",
          "wikiUrl": "string",
          "issuesUrl": "string",
          "sourceUrl": "string"
        },
        "summary": "string",
        "status": 1,
        "downloadCount": 0,
        "isFeatured": true,
        "primaryCategoryId": 0,
        "categories": [
          {
            "id": 0,
            "gameId": 0,
            "name": "string",
            "slug": "string",
            "url": "string",
            "iconUrl": "string",
            "dateModified": "2019-08-24T14:15:22Z",
            "isClass": true,
            "classId": 0,
            "parentCategoryId": 0,
            "displayIndex": 0
          }
        ],
        "classId": 0,
        "authors": [
          {
            "id": 0,
            "name": "string",
            "url": "string"
          }
        ],
        "logo": {
          "id": 0,
          "modId": 0,
          "title": "string",
          "description": "string",
          "thumbnailUrl": "string",
          "url": "string"
        },
        "screenshots": [
          {
            "id": 0,
            "modId": 0,
            "title": "string",
            "description": "string",
            "thumbnailUrl": "string",
            "url": "string"
          }
        ],
        "mainFileId": 0,
        "latestFiles": [
          {
            "id": 0,
            "gameId": 0,
            "modId": 0,
            "isAvailable": true,
            "displayName": "string",
            "fileName": "string",
            "releaseType": 1,
            "fileStatus": 1,
            "hashes": [
              {
                "value": "string",
                "algo": 1
              }
            ],
            "fileDate": "2019-08-24T14:15:22Z",
            "fileLength": 0,
            "downloadCount": 0,
            "fileSizeOnDisk": 0,
            "downloadUrl": "string",
            "gameVersions": [
              "string"
            ],
            "sortableGameVersions": [
              {
                "gameVersionName": "string",
                "gameVersionPadded": "string",
                "gameVersion": "string",
                "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
                "gameVersionTypeId": 0
              }
            ],
            "dependencies": [
              {
                "modId": 0,
                "relationType": 1
              }
            ],
            "exposeAsAlternative": true,
            "parentProjectFileId": 0,
            "alternateFileId": 0,
            "isServerPack": true,
            "serverPackFileId": 0,
            "isEarlyAccessContent": true,
            "earlyAccessEndDate": "2019-08-24T14:15:22Z",
            "fileFingerprint": 0,
            "modules": [
              {
                "name": "string",
                "fingerprint": 0
              }
            ]
          }
        ],
        "latestFilesIndexes": [
          {
            "gameVersion": "string",
            "fileId": 0,
            "filename": "string",
            "releaseType": 1,
            "gameVersionTypeId": 0,
            "modLoader": 0
          }
        ],
        "latestEarlyAccessFilesIndexes": [
          {
            "gameVersion": "string",
            "fileId": 0,
            "filename": "string",
            "releaseType": 1,
            "gameVersionTypeId": 0,
            "modLoader": 0
          }
        ],
        "dateCreated": "2019-08-24T14:15:22Z",
        "dateModified": "2019-08-24T14:15:22Z",
        "dateReleased": "2019-08-24T14:15:22Z",
        "allowModDistribution": true,
        "gamePopularityRank": 0,
        "isAvailable": true,
        "thumbsUpCount": 0,
        "rating": 0
      }
    ],
    "popular": [
      {
        "id": 0,
        "gameId": 0,
        "name": "string",
        "slug": "string",
        "links": {
          "websiteUrl": "string",
          "wikiUrl": "string",
          "issuesUrl": "string",
          "sourceUrl": "string"
        },
        "summary": "string",
        "status": 1,
        "downloadCount": 0,
        "isFeatured": true,
        "primaryCategoryId": 0,
        "categories": [
          {
            "id": 0,
            "gameId": 0,
            "name": "string",
            "slug": "string",
            "url": "string",
            "iconUrl": "string",
            "dateModified": "2019-08-24T14:15:22Z",
            "isClass": true,
            "classId": 0,
            "parentCategoryId": 0,
            "displayIndex": 0
          }
        ],
        "classId": 0,
        "authors": [
          {
            "id": 0,
            "name": "string",
            "url": "string"
          }
        ],
        "logo": {
          "id": 0,
          "modId": 0,
          "title": "string",
          "description": "string",
          "thumbnailUrl": "string",
          "url": "string"
        },
        "screenshots": [
          {
            "id": 0,
            "modId": 0,
            "title": "string",
            "description": "string",
            "thumbnailUrl": "string",
            "url": "string"
          }
        ],
        "mainFileId": 0,
        "latestFiles": [
          {
            "id": 0,
            "gameId": 0,
            "modId": 0,
            "isAvailable": true,
            "displayName": "string",
            "fileName": "string",
            "releaseType": 1,
            "fileStatus": 1,
            "hashes": [
              {
                "value": "string",
                "algo": 1
              }
            ],
            "fileDate": "2019-08-24T14:15:22Z",
            "fileLength": 0,
            "downloadCount": 0,
            "fileSizeOnDisk": 0,
            "downloadUrl": "string",
            "gameVersions": [
              "string"
            ],
            "sortableGameVersions": [
              {
                "gameVersionName": "string",
                "gameVersionPadded": "string",
                "gameVersion": "string",
                "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
                "gameVersionTypeId": 0
              }
            ],
            "dependencies": [
              {
                "modId": 0,
                "relationType": 1
              }
            ],
            "exposeAsAlternative": true,
            "parentProjectFileId": 0,
            "alternateFileId": 0,
            "isServerPack": true,
            "serverPackFileId": 0,
            "isEarlyAccessContent": true,
            "earlyAccessEndDate": "2019-08-24T14:15:22Z",
            "fileFingerprint": 0,
            "modules": [
              {
                "name": "string",
                "fingerprint": 0
              }
            ]
          }
        ],
        "latestFilesIndexes": [
          {
            "gameVersion": "string",
            "fileId": 0,
            "filename": "string",
            "releaseType": 1,
            "gameVersionTypeId": 0,
            "modLoader": 0
          }
        ],
        "latestEarlyAccessFilesIndexes": [
          {
            "gameVersion": "string",
            "fileId": 0,
            "filename": "string",
            "releaseType": 1,
            "gameVersionTypeId": 0,
            "modLoader": 0
          }
        ],
        "dateCreated": "2019-08-24T14:15:22Z",
        "dateModified": "2019-08-24T14:15:22Z",
        "dateReleased": "2019-08-24T14:15:22Z",
        "allowModDistribution": true,
        "gamePopularityRank": 0,
        "isAvailable": true,
        "thumbsUpCount": 0,
        "rating": 0
      }
    ],
    "recentlyUpdated": [
      {
        "id": 0,
        "gameId": 0,
        "name": "string",
        "slug": "string",
        "links": {
          "websiteUrl": "string",
          "wikiUrl": "string",
          "issuesUrl": "string",
          "sourceUrl": "string"
        },
        "summary": "string",
        "status": 1,
        "downloadCount": 0,
        "isFeatured": true,
        "primaryCategoryId": 0,
        "categories": [
          {
            "id": 0,
            "gameId": 0,
            "name": "string",
            "slug": "string",
            "url": "string",
            "iconUrl": "string",
            "dateModified": "2019-08-24T14:15:22Z",
            "isClass": true,
            "classId": 0,
            "parentCategoryId": 0,
            "displayIndex": 0
          }
        ],
        "classId": 0,
        "authors": [
          {
            "id": 0,
            "name": "string",
            "url": "string"
          }
        ],
        "logo": {
          "id": 0,
          "modId": 0,
          "title": "string",
          "description": "string",
          "thumbnailUrl": "string",
          "url": "string"
        },
        "screenshots": [
          {
            "id": 0,
            "modId": 0,
            "title": "string",
            "description": "string",
            "thumbnailUrl": "string",
            "url": "string"
          }
        ],
        "mainFileId": 0,
        "latestFiles": [
          {
            "id": 0,
            "gameId": 0,
            "modId": 0,
            "isAvailable": true,
            "displayName": "string",
            "fileName": "string",
            "releaseType": 1,
            "fileStatus": 1,
            "hashes": [
              {
                "value": "string",
                "algo": 1
              }
            ],
            "fileDate": "2019-08-24T14:15:22Z",
            "fileLength": 0,
            "downloadCount": 0,
            "fileSizeOnDisk": 0,
            "downloadUrl": "string",
            "gameVersions": [
              "string"
            ],
            "sortableGameVersions": [
              {
                "gameVersionName": "string",
                "gameVersionPadded": "string",
                "gameVersion": "string",
                "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
                "gameVersionTypeId": 0
              }
            ],
            "dependencies": [
              {
                "modId": 0,
                "relationType": 1
              }
            ],
            "exposeAsAlternative": true,
            "parentProjectFileId": 0,
            "alternateFileId": 0,
            "isServerPack": true,
            "serverPackFileId": 0,
            "isEarlyAccessContent": true,
            "earlyAccessEndDate": "2019-08-24T14:15:22Z",
            "fileFingerprint": 0,
            "modules": [
              {
                "name": "string",
                "fingerprint": 0
              }
            ]
          }
        ],
        "latestFilesIndexes": [
          {
            "gameVersion": "string",
            "fileId": 0,
            "filename": "string",
            "releaseType": 1,
            "gameVersionTypeId": 0,
            "modLoader": 0
          }
        ],
        "latestEarlyAccessFilesIndexes": [
          {
            "gameVersion": "string",
            "fileId": 0,
            "filename": "string",
            "releaseType": 1,
            "gameVersionTypeId": 0,
            "modLoader": 0
          }
        ],
        "dateCreated": "2019-08-24T14:15:22Z",
        "dateModified": "2019-08-24T14:15:22Z",
        "dateReleased": "2019-08-24T14:15:22Z",
        "allowModDistribution": true,
        "gamePopularityRank": 0,
        "isAvailable": true,
        "thumbsUpCount": 0,
        "rating": 0
      }
    ]
  }
}
Responses
Status	Meaning	Description	Schema
200	OK	none	Get Featured Mods Response
400	Bad Request	none	None
404	Not Found	none	None
500	Internal Server Error	none	None
To perform this operation, you must be authenticated by means of one of the following methods: API_KEY
Get Mod Description

Code samples


const headers = {
  'Accept':'application/json',
  'x-api-key':'API_KEY'
};

fetch('/v1/mods/{modId}/description',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

GET /v1/mods/{modId}/description

Get the full description of a mod in HTML format.

Parameters
Name	In	Type	Required	Description
modId	path	integer(int32)	true	The mod id
raw	query	boolean	false	none
stripped	query	boolean	false	none
markup	query	boolean	false	none
Example responses

200 Response

{
  "data": "string"
}
Responses
Status	Meaning	Description	Schema
200	OK	none	String Response
404	Not Found	none	None
500	Internal Server Error	none	None
To perform this operation, you must be authenticated by means of one of the following methods: API_KEY
Files
Get Mod File

Code samples


const headers = {
  'Accept':'application/json',
  'x-api-key':'API_KEY'
};

fetch('/v1/mods/{modId}/files/{fileId}',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

GET /v1/mods/{modId}/files/{fileId}

Get a single file of the specified mod.

Parameters
Name	In	Type	Required	Description
modId	path	integer(int32)	true	The mod id the file belongs to
fileId	path	integer(int32)	true	The file id
Example responses

200 Response

{
  "data": {
    "id": 0,
    "gameId": 0,
    "modId": 0,
    "isAvailable": true,
    "displayName": "string",
    "fileName": "string",
    "releaseType": 1,
    "fileStatus": 1,
    "hashes": [
      {
        "value": "string",
        "algo": 1
      }
    ],
    "fileDate": "2019-08-24T14:15:22Z",
    "fileLength": 0,
    "downloadCount": 0,
    "fileSizeOnDisk": 0,
    "downloadUrl": "string",
    "gameVersions": [
      "string"
    ],
    "sortableGameVersions": [
      {
        "gameVersionName": "string",
        "gameVersionPadded": "string",
        "gameVersion": "string",
        "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
        "gameVersionTypeId": 0
      }
    ],
    "dependencies": [
      {
        "modId": 0,
        "relationType": 1
      }
    ],
    "exposeAsAlternative": true,
    "parentProjectFileId": 0,
    "alternateFileId": 0,
    "isServerPack": true,
    "serverPackFileId": 0,
    "isEarlyAccessContent": true,
    "earlyAccessEndDate": "2019-08-24T14:15:22Z",
    "fileFingerprint": 0,
    "modules": [
      {
        "name": "string",
        "fingerprint": 0
      }
    ]
  }
}
Responses
Status	Meaning	Description	Schema
200	OK	none	Get Mod File Response
404	Not Found	none	None
500	Internal Server Error	none	None
To perform this operation, you must be authenticated by means of one of the following methods: API_KEY
Get Mod Files

Code samples


const headers = {
  'Accept':'application/json',
  'x-api-key':'API_KEY'
};

fetch('/v1/mods/{modId}/files',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

GET /v1/mods/{modId}/files

Get all files of the specified mod.

Parameters
Name	In	Type	Required	Description
modId	path	integer(int32)	true	The mod id the files belong to
gameVersion	query	string	false	Filter by game version string
modLoaderType	query	ModLoaderType	false	ModLoaderType enumeration
gameVersionTypeId	query	integer(int32)	false	Filter only files that are tagged with versions of the given gameVersionTypeId
index	query	integer(int32)	false	A zero based index of the first item to include in the response, the limit is: (index + pageSize <= 10,000).
pageSize	query	integer(int32)	false	The number of items to include in the response, the default/maximum value is 50.
Detailed descriptions
modLoaderType: ModLoaderType enumeration Filter only files associated to a given modloader (Forge, Fabric ...).

Enumerated Values
Parameter	Value
modLoaderType	0
modLoaderType	1
modLoaderType	2
modLoaderType	3
modLoaderType	4
modLoaderType	5
modLoaderType	6
Example responses

200 Response

{
  "data": [
    {
      "id": 0,
      "gameId": 0,
      "modId": 0,
      "isAvailable": true,
      "displayName": "string",
      "fileName": "string",
      "releaseType": 1,
      "fileStatus": 1,
      "hashes": [
        {
          "value": "string",
          "algo": 1
        }
      ],
      "fileDate": "2019-08-24T14:15:22Z",
      "fileLength": 0,
      "downloadCount": 0,
      "fileSizeOnDisk": 0,
      "downloadUrl": "string",
      "gameVersions": [
        "string"
      ],
      "sortableGameVersions": [
        {
          "gameVersionName": "string",
          "gameVersionPadded": "string",
          "gameVersion": "string",
          "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
          "gameVersionTypeId": 0
        }
      ],
      "dependencies": [
        {
          "modId": 0,
          "relationType": 1
        }
      ],
      "exposeAsAlternative": true,
      "parentProjectFileId": 0,
      "alternateFileId": 0,
      "isServerPack": true,
      "serverPackFileId": 0,
      "isEarlyAccessContent": true,
      "earlyAccessEndDate": "2019-08-24T14:15:22Z",
      "fileFingerprint": 0,
      "modules": [
        {
          "name": "string",
          "fingerprint": 0
        }
      ]
    }
  ],
  "pagination": {
    "index": 0,
    "pageSize": 0,
    "resultCount": 0,
    "totalCount": 0
  }
}
Responses
Status	Meaning	Description	Schema
200	OK	none	Get Mod Files Response
404	Not Found	none	None
500	Internal Server Error	none	None
To perform this operation, you must be authenticated by means of one of the following methods: API_KEY
Get Files

Code samples

const inputBody = '{
  "fileIds": [
    0
  ]
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'x-api-key':'API_KEY'
};

fetch('/v1/mods/files',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

POST /v1/mods/files

Get a list of files.

Body parameter

{
  "fileIds": [
    0
  ]
}
Parameters
Name	In	Type	Required	Description
body	body	GetModFilesRequestBody	true	Request body containing a list of file ids to fetch
Example responses

200 Response

{
  "data": [
    {
      "id": 0,
      "gameId": 0,
      "modId": 0,
      "isAvailable": true,
      "displayName": "string",
      "fileName": "string",
      "releaseType": 1,
      "fileStatus": 1,
      "hashes": [
        {
          "value": "string",
          "algo": 1
        }
      ],
      "fileDate": "2019-08-24T14:15:22Z",
      "fileLength": 0,
      "downloadCount": 0,
      "fileSizeOnDisk": 0,
      "downloadUrl": "string",
      "gameVersions": [
        "string"
      ],
      "sortableGameVersions": [
        {
          "gameVersionName": "string",
          "gameVersionPadded": "string",
          "gameVersion": "string",
          "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
          "gameVersionTypeId": 0
        }
      ],
      "dependencies": [
        {
          "modId": 0,
          "relationType": 1
        }
      ],
      "exposeAsAlternative": true,
      "parentProjectFileId": 0,
      "alternateFileId": 0,
      "isServerPack": true,
      "serverPackFileId": 0,
      "isEarlyAccessContent": true,
      "earlyAccessEndDate": "2019-08-24T14:15:22Z",
      "fileFingerprint": 0,
      "modules": [
        {
          "name": "string",
          "fingerprint": 0
        }
      ]
    }
  ]
}
Responses
Status	Meaning	Description	Schema
200	OK	none	Get Files Response
400	Bad Request	none	None
404	Not Found	none	None
500	Internal Server Error	none	None
To perform this operation, you must be authenticated by means of one of the following methods: API_KEY
Get Mod File Changelog

Code samples


const headers = {
  'Accept':'application/json',
  'x-api-key':'API_KEY'
};

fetch('/v1/mods/{modId}/files/{fileId}/changelog',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

GET /v1/mods/{modId}/files/{fileId}/changelog

Get the changelog of a file in HTML format.

Parameters
Name	In	Type	Required	Description
modId	path	integer(int32)	true	The mod id the file belongs to
fileId	path	integer(int32)	true	The file id
Example responses

200 Response

{
  "data": "string"
}
Responses
Status	Meaning	Description	Schema
200	OK	none	String Response
404	Not Found	none	None
500	Internal Server Error	none	None
To perform this operation, you must be authenticated by means of one of the following methods: API_KEY
Get Mod File Download URL

Code samples


const headers = {
  'Accept':'application/json',
  'x-api-key':'API_KEY'
};

fetch('/v1/mods/{modId}/files/{fileId}/download-url',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

GET /v1/mods/{modId}/files/{fileId}/download-url

Get a download url for a specific file.

Parameters
Name	In	Type	Required	Description
modId	path	integer(int32)	true	The mod id the file belongs to
fileId	path	integer(int32)	true	The file id
Example responses

200 Response

{
  "data": "string"
}
Responses
Status	Meaning	Description	Schema
200	OK	none	String Response
404	Not Found	none	None
500	Internal Server Error	none	None
To perform this operation, you must be authenticated by means of one of the following methods: API_KEY
Fingerprints
Get Fingerprints Matches By Game Id

Code samples

const inputBody = '{
  "fingerprints": [
    0
  ]
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'x-api-key':'API_KEY'
};

fetch('/v1/fingerprints/{gameId}',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

POST /v1/fingerprints/{gameId}

Get mod files that match a list of fingerprints for a given game id.

Body parameter

{
  "fingerprints": [
    0
  ]
}
Parameters
Name	In	Type	Required	Description
gameId	path	integer(int32)	true	The game id for matching fingerprints
body	body	GetFingerprintMatchesRequestBody	true	The request body containing an array of fingerprints
Example responses

200 Response

{
  "data": {
    "isCacheBuilt": true,
    "exactMatches": [
      {
        "id": 0,
        "file": {
          "id": 0,
          "gameId": 0,
          "modId": 0,
          "isAvailable": true,
          "displayName": "string",
          "fileName": "string",
          "releaseType": 1,
          "fileStatus": 1,
          "hashes": [
            {
              "value": "string",
              "algo": 1
            }
          ],
          "fileDate": "2019-08-24T14:15:22Z",
          "fileLength": 0,
          "downloadCount": 0,
          "fileSizeOnDisk": 0,
          "downloadUrl": "string",
          "gameVersions": [
            "string"
          ],
          "sortableGameVersions": [
            {
              "gameVersionName": "string",
              "gameVersionPadded": "string",
              "gameVersion": "string",
              "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
              "gameVersionTypeId": 0
            }
          ],
          "dependencies": [
            {
              "modId": 0,
              "relationType": 1
            }
          ],
          "exposeAsAlternative": true,
          "parentProjectFileId": 0,
          "alternateFileId": 0,
          "isServerPack": true,
          "serverPackFileId": 0,
          "isEarlyAccessContent": true,
          "earlyAccessEndDate": "2019-08-24T14:15:22Z",
          "fileFingerprint": 0,
          "modules": [
            {
              "name": "string",
              "fingerprint": 0
            }
          ]
        },
        "latestFiles": [
          {
            "id": 0,
            "gameId": 0,
            "modId": 0,
            "isAvailable": true,
            "displayName": "string",
            "fileName": "string",
            "releaseType": 1,
            "fileStatus": 1,
            "hashes": [
              {
                "value": "string",
                "algo": 1
              }
            ],
            "fileDate": "2019-08-24T14:15:22Z",
            "fileLength": 0,
            "downloadCount": 0,
            "fileSizeOnDisk": 0,
            "downloadUrl": "string",
            "gameVersions": [
              "string"
            ],
            "sortableGameVersions": [
              {
                "gameVersionName": "string",
                "gameVersionPadded": "string",
                "gameVersion": "string",
                "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
                "gameVersionTypeId": 0
              }
            ],
            "dependencies": [
              {
                "modId": 0,
                "relationType": 1
              }
            ],
            "exposeAsAlternative": true,
            "parentProjectFileId": 0,
            "alternateFileId": 0,
            "isServerPack": true,
            "serverPackFileId": 0,
            "isEarlyAccessContent": true,
            "earlyAccessEndDate": "2019-08-24T14:15:22Z",
            "fileFingerprint": 0,
            "modules": [
              {
                "name": "string",
                "fingerprint": 0
              }
            ]
          }
        ]
      }
    ],
    "exactFingerprints": [
      0
    ],
    "partialMatches": [
      {
        "id": 0,
        "file": {
          "id": 0,
          "gameId": 0,
          "modId": 0,
          "isAvailable": true,
          "displayName": "string",
          "fileName": "string",
          "releaseType": 1,
          "fileStatus": 1,
          "hashes": [
            {
              "value": "string",
              "algo": 1
            }
          ],
          "fileDate": "2019-08-24T14:15:22Z",
          "fileLength": 0,
          "downloadCount": 0,
          "fileSizeOnDisk": 0,
          "downloadUrl": "string",
          "gameVersions": [
            "string"
          ],
          "sortableGameVersions": [
            {
              "gameVersionName": "string",
              "gameVersionPadded": "string",
              "gameVersion": "string",
              "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
              "gameVersionTypeId": 0
            }
          ],
          "dependencies": [
            {
              "modId": 0,
              "relationType": 1
            }
          ],
          "exposeAsAlternative": true,
          "parentProjectFileId": 0,
          "alternateFileId": 0,
          "isServerPack": true,
          "serverPackFileId": 0,
          "isEarlyAccessContent": true,
          "earlyAccessEndDate": "2019-08-24T14:15:22Z",
          "fileFingerprint": 0,
          "modules": [
            {
              "name": "string",
              "fingerprint": 0
            }
          ]
        },
        "latestFiles": [
          {
            "id": 0,
            "gameId": 0,
            "modId": 0,
            "isAvailable": true,
            "displayName": "string",
            "fileName": "string",
            "releaseType": 1,
            "fileStatus": 1,
            "hashes": [
              {
                "value": "string",
                "algo": 1
              }
            ],
            "fileDate": "2019-08-24T14:15:22Z",
            "fileLength": 0,
            "downloadCount": 0,
            "fileSizeOnDisk": 0,
            "downloadUrl": "string",
            "gameVersions": [
              "string"
            ],
            "sortableGameVersions": [
              {
                "gameVersionName": "string",
                "gameVersionPadded": "string",
                "gameVersion": "string",
                "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
                "gameVersionTypeId": 0
              }
            ],
            "dependencies": [
              {
                "modId": 0,
                "relationType": 1
              }
            ],
            "exposeAsAlternative": true,
            "parentProjectFileId": 0,
            "alternateFileId": 0,
            "isServerPack": true,
            "serverPackFileId": 0,
            "isEarlyAccessContent": true,
            "earlyAccessEndDate": "2019-08-24T14:15:22Z",
            "fileFingerprint": 0,
            "modules": [
              {
                "name": "string",
                "fingerprint": 0
              }
            ]
          }
        ]
      }
    ],
    "partialMatchFingerprints": {
      "property1": [
        0
      ],
      "property2": [
        0
      ]
    },
    "installedFingerprints": [
      0
    ],
    "unmatchedFingerprints": [
      0
    ]
  }
}
Responses
Status	Meaning	Description	Schema
200	OK	none	Get Fingerprint Matches Response
400	Bad Request	none	None
503	Service Unavailable	none	string
To perform this operation, you must be authenticated by means of one of the following methods: API_KEY
Get Fingerprints Matches

Code samples

const inputBody = '{
  "fingerprints": [
    0
  ]
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'x-api-key':'API_KEY'
};

fetch('/v1/fingerprints',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

POST /v1/fingerprints

Get mod files that match a list of fingerprints.

Body parameter

{
  "fingerprints": [
    0
  ]
}
Parameters
Name	In	Type	Required	Description
body	body	GetFingerprintMatchesRequestBody	true	The request body containing an array of fingerprints
Example responses

200 Response

{
  "data": {
    "isCacheBuilt": true,
    "exactMatches": [
      {
        "id": 0,
        "file": {
          "id": 0,
          "gameId": 0,
          "modId": 0,
          "isAvailable": true,
          "displayName": "string",
          "fileName": "string",
          "releaseType": 1,
          "fileStatus": 1,
          "hashes": [
            {
              "value": "string",
              "algo": 1
            }
          ],
          "fileDate": "2019-08-24T14:15:22Z",
          "fileLength": 0,
          "downloadCount": 0,
          "fileSizeOnDisk": 0,
          "downloadUrl": "string",
          "gameVersions": [
            "string"
          ],
          "sortableGameVersions": [
            {
              "gameVersionName": "string",
              "gameVersionPadded": "string",
              "gameVersion": "string",
              "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
              "gameVersionTypeId": 0
            }
          ],
          "dependencies": [
            {
              "modId": 0,
              "relationType": 1
            }
          ],
          "exposeAsAlternative": true,
          "parentProjectFileId": 0,
          "alternateFileId": 0,
          "isServerPack": true,
          "serverPackFileId": 0,
          "isEarlyAccessContent": true,
          "earlyAccessEndDate": "2019-08-24T14:15:22Z",
          "fileFingerprint": 0,
          "modules": [
            {
              "name": "string",
              "fingerprint": 0
            }
          ]
        },
        "latestFiles": [
          {
            "id": 0,
            "gameId": 0,
            "modId": 0,
            "isAvailable": true,
            "displayName": "string",
            "fileName": "string",
            "releaseType": 1,
            "fileStatus": 1,
            "hashes": [
              {
                "value": "string",
                "algo": 1
              }
            ],
            "fileDate": "2019-08-24T14:15:22Z",
            "fileLength": 0,
            "downloadCount": 0,
            "fileSizeOnDisk": 0,
            "downloadUrl": "string",
            "gameVersions": [
              "string"
            ],
            "sortableGameVersions": [
              {
                "gameVersionName": "string",
                "gameVersionPadded": "string",
                "gameVersion": "string",
                "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
                "gameVersionTypeId": 0
              }
            ],
            "dependencies": [
              {
                "modId": 0,
                "relationType": 1
              }
            ],
            "exposeAsAlternative": true,
            "parentProjectFileId": 0,
            "alternateFileId": 0,
            "isServerPack": true,
            "serverPackFileId": 0,
            "isEarlyAccessContent": true,
            "earlyAccessEndDate": "2019-08-24T14:15:22Z",
            "fileFingerprint": 0,
            "modules": [
              {
                "name": "string",
                "fingerprint": 0
              }
            ]
          }
        ]
      }
    ],
    "exactFingerprints": [
      0
    ],
    "partialMatches": [
      {
        "id": 0,
        "file": {
          "id": 0,
          "gameId": 0,
          "modId": 0,
          "isAvailable": true,
          "displayName": "string",
          "fileName": "string",
          "releaseType": 1,
          "fileStatus": 1,
          "hashes": [
            {
              "value": "string",
              "algo": 1
            }
          ],
          "fileDate": "2019-08-24T14:15:22Z",
          "fileLength": 0,
          "downloadCount": 0,
          "fileSizeOnDisk": 0,
          "downloadUrl": "string",
          "gameVersions": [
            "string"
          ],
          "sortableGameVersions": [
            {
              "gameVersionName": "string",
              "gameVersionPadded": "string",
              "gameVersion": "string",
              "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
              "gameVersionTypeId": 0
            }
          ],
          "dependencies": [
            {
              "modId": 0,
              "relationType": 1
            }
          ],
          "exposeAsAlternative": true,
          "parentProjectFileId": 0,
          "alternateFileId": 0,
          "isServerPack": true,
          "serverPackFileId": 0,
          "isEarlyAccessContent": true,
          "earlyAccessEndDate": "2019-08-24T14:15:22Z",
          "fileFingerprint": 0,
          "modules": [
            {
              "name": "string",
              "fingerprint": 0
            }
          ]
        },
        "latestFiles": [
          {
            "id": 0,
            "gameId": 0,
            "modId": 0,
            "isAvailable": true,
            "displayName": "string",
            "fileName": "string",
            "releaseType": 1,
            "fileStatus": 1,
            "hashes": [
              {
                "value": "string",
                "algo": 1
              }
            ],
            "fileDate": "2019-08-24T14:15:22Z",
            "fileLength": 0,
            "downloadCount": 0,
            "fileSizeOnDisk": 0,
            "downloadUrl": "string",
            "gameVersions": [
              "string"
            ],
            "sortableGameVersions": [
              {
                "gameVersionName": "string",
                "gameVersionPadded": "string",
                "gameVersion": "string",
                "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
                "gameVersionTypeId": 0
              }
            ],
            "dependencies": [
              {
                "modId": 0,
                "relationType": 1
              }
            ],
            "exposeAsAlternative": true,
            "parentProjectFileId": 0,
            "alternateFileId": 0,
            "isServerPack": true,
            "serverPackFileId": 0,
            "isEarlyAccessContent": true,
            "earlyAccessEndDate": "2019-08-24T14:15:22Z",
            "fileFingerprint": 0,
            "modules": [
              {
                "name": "string",
                "fingerprint": 0
              }
            ]
          }
        ]
      }
    ],
    "partialMatchFingerprints": {
      "property1": [
        0
      ],
      "property2": [
        0
      ]
    },
    "installedFingerprints": [
      0
    ],
    "unmatchedFingerprints": [
      0
    ]
  }
}
Responses
Status	Meaning	Description	Schema
200	OK	none	Get Fingerprint Matches Response
400	Bad Request	none	None
503	Service Unavailable	none	string
To perform this operation, you must be authenticated by means of one of the following methods: API_KEY
Get Fingerprints Fuzzy Matches By Game Id

Code samples

const inputBody = '{
  "gameId": 0,
  "fingerprints": [
    {
      "foldername": "string",
      "fingerprints": [
        0
      ]
    }
  ]
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'x-api-key':'API_KEY'
};

fetch('/v1/fingerprints/fuzzy/{gameId}',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

POST /v1/fingerprints/fuzzy/{gameId}

Get mod files that match a list of fingerprints using fuzzy matching.

Body parameter

{
  "gameId": 0,
  "fingerprints": [
    {
      "foldername": "string",
      "fingerprints": [
        0
      ]
    }
  ]
}
Parameters
Name	In	Type	Required	Description
gameId	path	integer(int32)	true	The game id for matching fingerprints
body	body	GetFuzzyMatchesRequestBody	true	Game id and folder fingerprints options for the fuzzy matching
Example responses

200 Response

{
  "data": {
    "fuzzyMatches": [
      {
        "id": 0,
        "file": {
          "id": 0,
          "gameId": 0,
          "modId": 0,
          "isAvailable": true,
          "displayName": "string",
          "fileName": "string",
          "releaseType": 1,
          "fileStatus": 1,
          "hashes": [
            {
              "value": "string",
              "algo": 1
            }
          ],
          "fileDate": "2019-08-24T14:15:22Z",
          "fileLength": 0,
          "downloadCount": 0,
          "fileSizeOnDisk": 0,
          "downloadUrl": "string",
          "gameVersions": [
            "string"
          ],
          "sortableGameVersions": [
            {
              "gameVersionName": "string",
              "gameVersionPadded": "string",
              "gameVersion": "string",
              "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
              "gameVersionTypeId": 0
            }
          ],
          "dependencies": [
            {
              "modId": 0,
              "relationType": 1
            }
          ],
          "exposeAsAlternative": true,
          "parentProjectFileId": 0,
          "alternateFileId": 0,
          "isServerPack": true,
          "serverPackFileId": 0,
          "isEarlyAccessContent": true,
          "earlyAccessEndDate": "2019-08-24T14:15:22Z",
          "fileFingerprint": 0,
          "modules": [
            {
              "name": "string",
              "fingerprint": 0
            }
          ]
        },
        "latestFiles": [
          {
            "id": 0,
            "gameId": 0,
            "modId": 0,
            "isAvailable": true,
            "displayName": "string",
            "fileName": "string",
            "releaseType": 1,
            "fileStatus": 1,
            "hashes": [
              {
                "value": "string",
                "algo": 1
              }
            ],
            "fileDate": "2019-08-24T14:15:22Z",
            "fileLength": 0,
            "downloadCount": 0,
            "fileSizeOnDisk": 0,
            "downloadUrl": "string",
            "gameVersions": [
              "string"
            ],
            "sortableGameVersions": [
              {
                "gameVersionName": "string",
                "gameVersionPadded": "string",
                "gameVersion": "string",
                "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
                "gameVersionTypeId": 0
              }
            ],
            "dependencies": [
              {
                "modId": 0,
                "relationType": 1
              }
            ],
            "exposeAsAlternative": true,
            "parentProjectFileId": 0,
            "alternateFileId": 0,
            "isServerPack": true,
            "serverPackFileId": 0,
            "isEarlyAccessContent": true,
            "earlyAccessEndDate": "2019-08-24T14:15:22Z",
            "fileFingerprint": 0,
            "modules": [
              {
                "name": "string",
                "fingerprint": 0
              }
            ]
          }
        ],
        "fingerprints": [
          0
        ]
      }
    ]
  }
}
Responses
Status	Meaning	Description	Schema
200	OK	none	Get Fingerprints Fuzzy Matches Response
400	Bad Request	none	None
503	Service Unavailable	none	string
To perform this operation, you must be authenticated by means of one of the following methods: API_KEY
Get Fingerprints Fuzzy Matches

Code samples

const inputBody = '{
  "gameId": 0,
  "fingerprints": [
    {
      "foldername": "string",
      "fingerprints": [
        0
      ]
    }
  ]
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'x-api-key':'API_KEY'
};

fetch('/v1/fingerprints/fuzzy',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

POST /v1/fingerprints/fuzzy

Get mod files that match a list of fingerprints using fuzzy matching.

Body parameter

{
  "gameId": 0,
  "fingerprints": [
    {
      "foldername": "string",
      "fingerprints": [
        0
      ]
    }
  ]
}
Parameters
Name	In	Type	Required	Description
body	body	GetFuzzyMatchesRequestBody	true	Game id and folder fingerprints options for the fuzzy matching
Example responses

200 Response

{
  "data": {
    "fuzzyMatches": [
      {
        "id": 0,
        "file": {
          "id": 0,
          "gameId": 0,
          "modId": 0,
          "isAvailable": true,
          "displayName": "string",
          "fileName": "string",
          "releaseType": 1,
          "fileStatus": 1,
          "hashes": [
            {
              "value": "string",
              "algo": 1
            }
          ],
          "fileDate": "2019-08-24T14:15:22Z",
          "fileLength": 0,
          "downloadCount": 0,
          "fileSizeOnDisk": 0,
          "downloadUrl": "string",
          "gameVersions": [
            "string"
          ],
          "sortableGameVersions": [
            {
              "gameVersionName": "string",
              "gameVersionPadded": "string",
              "gameVersion": "string",
              "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
              "gameVersionTypeId": 0
            }
          ],
          "dependencies": [
            {
              "modId": 0,
              "relationType": 1
            }
          ],
          "exposeAsAlternative": true,
          "parentProjectFileId": 0,
          "alternateFileId": 0,
          "isServerPack": true,
          "serverPackFileId": 0,
          "isEarlyAccessContent": true,
          "earlyAccessEndDate": "2019-08-24T14:15:22Z",
          "fileFingerprint": 0,
          "modules": [
            {
              "name": "string",
              "fingerprint": 0
            }
          ]
        },
        "latestFiles": [
          {
            "id": 0,
            "gameId": 0,
            "modId": 0,
            "isAvailable": true,
            "displayName": "string",
            "fileName": "string",
            "releaseType": 1,
            "fileStatus": 1,
            "hashes": [
              {
                "value": "string",
                "algo": 1
              }
            ],
            "fileDate": "2019-08-24T14:15:22Z",
            "fileLength": 0,
            "downloadCount": 0,
            "fileSizeOnDisk": 0,
            "downloadUrl": "string",
            "gameVersions": [
              "string"
            ],
            "sortableGameVersions": [
              {
                "gameVersionName": "string",
                "gameVersionPadded": "string",
                "gameVersion": "string",
                "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
                "gameVersionTypeId": 0
              }
            ],
            "dependencies": [
              {
                "modId": 0,
                "relationType": 1
              }
            ],
            "exposeAsAlternative": true,
            "parentProjectFileId": 0,
            "alternateFileId": 0,
            "isServerPack": true,
            "serverPackFileId": 0,
            "isEarlyAccessContent": true,
            "earlyAccessEndDate": "2019-08-24T14:15:22Z",
            "fileFingerprint": 0,
            "modules": [
              {
                "name": "string",
                "fingerprint": 0
              }
            ]
          }
        ],
        "fingerprints": [
          0
        ]
      }
    ]
  }
}
Responses
Status	Meaning	Description	Schema
200	OK	none	Get Fingerprints Fuzzy Matches Response
400	Bad Request	none	None
503	Service Unavailable	none	string
To perform this operation, you must be authenticated by means of one of the following methods: API_KEY
Minecraft
Get Minecraft Versions

Code samples


const headers = {
  'Accept':'application/json',
  'x-api-key':'API_KEY'
};

fetch('/v1/minecraft/version',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

GET /v1/minecraft/version

Parameters
Name	In	Type	Required	Description
sortDescending	query	boolean	false	none
Example responses

200 Response

{
  "data": [
    {
      "id": 0,
      "gameVersionId": 0,
      "versionString": "string",
      "jarDownloadUrl": "string",
      "jsonDownloadUrl": "string",
      "approved": true,
      "dateModified": "2019-08-24T14:15:22Z",
      "gameVersionTypeId": 0,
      "gameVersionStatus": 1,
      "gameVersionTypeStatus": 1
    }
  ]
}
Responses
Status	Meaning	Description	Schema
200	OK	none	ApiResponseOfListOfMinecraftGameVersion
404	Not Found	none	None
500	Internal Server Error	none	None
To perform this operation, you must be authenticated by means of one of the following methods: API_KEY
Get Specific Minecraft Version

Code samples


const headers = {
  'Accept':'application/json',
  'x-api-key':'API_KEY'
};

fetch('/v1/minecraft/version/{gameVersionString}',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

GET /v1/minecraft/version/{gameVersionString}

Parameters
Name	In	Type	Required	Description
gameVersionString	path	string	true	none
Example responses

200 Response

{
  "data": {
    "id": 0,
    "gameVersionId": 0,
    "versionString": "string",
    "jarDownloadUrl": "string",
    "jsonDownloadUrl": "string",
    "approved": true,
    "dateModified": "2019-08-24T14:15:22Z",
    "gameVersionTypeId": 0,
    "gameVersionStatus": 1,
    "gameVersionTypeStatus": 1
  }
}
Responses
Status	Meaning	Description	Schema
200	OK	none	ApiResponseOfMinecraftGameVersion
404	Not Found	none	None
500	Internal Server Error	none	None
To perform this operation, you must be authenticated by means of one of the following methods: API_KEY
Get Minecraft ModLoaders

Code samples


const headers = {
  'Accept':'application/json',
  'x-api-key':'API_KEY'
};

fetch('/v1/minecraft/modloader',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

GET /v1/minecraft/modloader

Parameters
Name	In	Type	Required	Description
version	query	string	false	none
includeAll	query	boolean	false	none
Example responses

200 Response

{
  "data": [
    {
      "name": "string",
      "gameVersion": "string",
      "latest": true,
      "recommended": true,
      "dateModified": "2019-08-24T14:15:22Z",
      "type": 0
    }
  ]
}
Responses
Status	Meaning	Description	Schema
200	OK	none	ApiResponseOfListOfMinecraftModLoaderIndex
404	Not Found	none	None
500	Internal Server Error	none	None
To perform this operation, you must be authenticated by means of one of the following methods: API_KEY
Get Specific Minecraft ModLoader

Code samples


const headers = {
  'Accept':'application/json',
  'x-api-key':'API_KEY'
};

fetch('/v1/minecraft/modloader/{modLoaderName}',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

GET /v1/minecraft/modloader/{modLoaderName}

Parameters
Name	In	Type	Required	Description
modLoaderName	path	string	true	none
Example responses

200 Response

{
  "data": {
    "id": 0,
    "gameVersionId": 0,
    "minecraftGameVersionId": 0,
    "forgeVersion": "string",
    "name": "string",
    "type": 0,
    "downloadUrl": "string",
    "filename": "string",
    "installMethod": 1,
    "latest": true,
    "recommended": true,
    "approved": true,
    "dateModified": "2019-08-24T14:15:22Z",
    "mavenVersionString": "string",
    "versionJson": "string",
    "librariesInstallLocation": "string",
    "minecraftVersion": "string",
    "additionalFilesJson": "string",
    "modLoaderGameVersionId": 0,
    "modLoaderGameVersionTypeId": 0,
    "modLoaderGameVersionStatus": 1,
    "modLoaderGameVersionTypeStatus": 1,
    "mcGameVersionId": 0,
    "mcGameVersionTypeId": 0,
    "mcGameVersionStatus": 1,
    "mcGameVersionTypeStatus": 1,
    "installProfileJson": "string"
  }
}
Responses
Status	Meaning	Description	Schema
200	OK	none	ApiResponseOfMinecraftModLoaderVersion
404	Not Found	none	None
500	Internal Server Error	none	None
To perform this operation, you must be authenticated by means of one of the following methods: API_KEY
Schemas
ApiResponseOfListOfMinecraftGameVersion

{
  "data": [
    {
      "id": 0,
      "gameVersionId": 0,
      "versionString": "string",
      "jarDownloadUrl": "string",
      "jsonDownloadUrl": "string",
      "approved": true,
      "dateModified": "2019-08-24T14:15:22Z",
      "gameVersionTypeId": 0,
      "gameVersionStatus": 1,
      "gameVersionTypeStatus": 1
    }
  ]
}

Properties
Name	Type	Description
data	[MinecraftGameVersion]	The response data
ApiResponseOfListOfMinecraftModLoaderIndex

{
  "data": [
    {
      "name": "string",
      "gameVersion": "string",
      "latest": true,
      "recommended": true,
      "dateModified": "2019-08-24T14:15:22Z",
      "type": 0
    }
  ]
}

Properties
Name	Type	Description
data	[MinecraftModLoaderIndex]	The response data
ApiResponseOfMinecraftGameVersion

{
  "data": {
    "id": 0,
    "gameVersionId": 0,
    "versionString": "string",
    "jarDownloadUrl": "string",
    "jsonDownloadUrl": "string",
    "approved": true,
    "dateModified": "2019-08-24T14:15:22Z",
    "gameVersionTypeId": 0,
    "gameVersionStatus": 1,
    "gameVersionTypeStatus": 1
  }
}

Properties
Name	Type	Description
data	MinecraftGameVersion	The response data
ApiResponseOfMinecraftModLoaderVersion

{
  "data": {
    "id": 0,
    "gameVersionId": 0,
    "minecraftGameVersionId": 0,
    "forgeVersion": "string",
    "name": "string",
    "type": 0,
    "downloadUrl": "string",
    "filename": "string",
    "installMethod": 1,
    "latest": true,
    "recommended": true,
    "approved": true,
    "dateModified": "2019-08-24T14:15:22Z",
    "mavenVersionString": "string",
    "versionJson": "string",
    "librariesInstallLocation": "string",
    "minecraftVersion": "string",
    "additionalFilesJson": "string",
    "modLoaderGameVersionId": 0,
    "modLoaderGameVersionTypeId": 0,
    "modLoaderGameVersionStatus": 1,
    "modLoaderGameVersionTypeStatus": 1,
    "mcGameVersionId": 0,
    "mcGameVersionTypeId": 0,
    "mcGameVersionStatus": 1,
    "mcGameVersionTypeStatus": 1,
    "installProfileJson": "string"
  }
}

Properties
Name	Type	Description
data	MinecraftModLoaderVersion	The response data
Category

{
  "id": 0,
  "gameId": 0,
  "name": "string",
  "slug": "string",
  "url": "string",
  "iconUrl": "string",
  "dateModified": "2019-08-24T14:15:22Z",
  "isClass": true,
  "classId": 0,
  "parentCategoryId": 0,
  "displayIndex": 0
}

Properties
Name	Type	Description
id	integer(int32)	The category id
gameId	integer(int32)	The game id related to the category
name	string	Category name
slug	string	The category slug as it appear in the URL
url	string	The category URL
iconUrl	string	URL for the category icon
dateModified	string(date-time)	Last modified date of the category
isClass	boolean¦null	A top level category for other categories
classId	integer(int32)¦null	The class id of the category, meaning - the class of which this category is under
parentCategoryId	integer(int32)¦null	The parent category for this category
displayIndex	integer(int32)¦null	The display index for this category
CoreApiStatus

1

Possible enum values:

1=Private

2=Public

CoreStatus

1

Possible enum values:

1=Draft

2=Test

3=PendingReview

4=Rejected

5=Approved

6=Live

FeaturedModsResponse

{
  "featured": [
    {
      "id": 0,
      "gameId": 0,
      "name": "string",
      "slug": "string",
      "links": {
        "websiteUrl": "string",
        "wikiUrl": "string",
        "issuesUrl": "string",
        "sourceUrl": "string"
      },
      "summary": "string",
      "status": 1,
      "downloadCount": 0,
      "isFeatured": true,
      "primaryCategoryId": 0,
      "categories": [
        {
          "id": 0,
          "gameId": 0,
          "name": "string",
          "slug": "string",
          "url": "string",
          "iconUrl": "string",
          "dateModified": "2019-08-24T14:15:22Z",
          "isClass": true,
          "classId": 0,
          "parentCategoryId": 0,
          "displayIndex": 0
        }
      ],
      "classId": 0,
      "authors": [
        {
          "id": 0,
          "name": "string",
          "url": "string"
        }
      ],
      "logo": {
        "id": 0,
        "modId": 0,
        "title": "string",
        "description": "string",
        "thumbnailUrl": "string",
        "url": "string"
      },
      "screenshots": [
        {
          "id": 0,
          "modId": 0,
          "title": "string",
          "description": "string",
          "thumbnailUrl": "string",
          "url": "string"
        }
      ],
      "mainFileId": 0,
      "latestFiles": [
        {
          "id": 0,
          "gameId": 0,
          "modId": 0,
          "isAvailable": true,
          "displayName": "string",
          "fileName": "string",
          "releaseType": 1,
          "fileStatus": 1,
          "hashes": [
            {
              "value": "string",
              "algo": 1
            }
          ],
          "fileDate": "2019-08-24T14:15:22Z",
          "fileLength": 0,
          "downloadCount": 0,
          "fileSizeOnDisk": 0,
          "downloadUrl": "string",
          "gameVersions": [
            "string"
          ],
          "sortableGameVersions": [
            {
              "gameVersionName": "string",
              "gameVersionPadded": "string",
              "gameVersion": "string",
              "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
              "gameVersionTypeId": 0
            }
          ],
          "dependencies": [
            {
              "modId": 0,
              "relationType": 1
            }
          ],
          "exposeAsAlternative": true,
          "parentProjectFileId": 0,
          "alternateFileId": 0,
          "isServerPack": true,
          "serverPackFileId": 0,
          "isEarlyAccessContent": true,
          "earlyAccessEndDate": "2019-08-24T14:15:22Z",
          "fileFingerprint": 0,
          "modules": [
            {
              "name": "string",
              "fingerprint": 0
            }
          ]
        }
      ],
      "latestFilesIndexes": [
        {
          "gameVersion": "string",
          "fileId": 0,
          "filename": "string",
          "releaseType": 1,
          "gameVersionTypeId": 0,
          "modLoader": 0
        }
      ],
      "latestEarlyAccessFilesIndexes": [
        {
          "gameVersion": "string",
          "fileId": 0,
          "filename": "string",
          "releaseType": 1,
          "gameVersionTypeId": 0,
          "modLoader": 0
        }
      ],
      "dateCreated": "2019-08-24T14:15:22Z",
      "dateModified": "2019-08-24T14:15:22Z",
      "dateReleased": "2019-08-24T14:15:22Z",
      "allowModDistribution": true,
      "gamePopularityRank": 0,
      "isAvailable": true,
      "thumbsUpCount": 0,
      "rating": 0
    }
  ],
  "popular": [
    {
      "id": 0,
      "gameId": 0,
      "name": "string",
      "slug": "string",
      "links": {
        "websiteUrl": "string",
        "wikiUrl": "string",
        "issuesUrl": "string",
        "sourceUrl": "string"
      },
      "summary": "string",
      "status": 1,
      "downloadCount": 0,
      "isFeatured": true,
      "primaryCategoryId": 0,
      "categories": [
        {
          "id": 0,
          "gameId": 0,
          "name": "string",
          "slug": "string",
          "url": "string",
          "iconUrl": "string",
          "dateModified": "2019-08-24T14:15:22Z",
          "isClass": true,
          "classId": 0,
          "parentCategoryId": 0,
          "displayIndex": 0
        }
      ],
      "classId": 0,
      "authors": [
        {
          "id": 0,
          "name": "string",
          "url": "string"
        }
      ],
      "logo": {
        "id": 0,
        "modId": 0,
        "title": "string",
        "description": "string",
        "thumbnailUrl": "string",
        "url": "string"
      },
      "screenshots": [
        {
          "id": 0,
          "modId": 0,
          "title": "string",
          "description": "string",
          "thumbnailUrl": "string",
          "url": "string"
        }
      ],
      "mainFileId": 0,
      "latestFiles": [
        {
          "id": 0,
          "gameId": 0,
          "modId": 0,
          "isAvailable": true,
          "displayName": "string",
          "fileName": "string",
          "releaseType": 1,
          "fileStatus": 1,
          "hashes": [
            {
              "value": "string",
              "algo": 1
            }
          ],
          "fileDate": "2019-08-24T14:15:22Z",
          "fileLength": 0,
          "downloadCount": 0,
          "fileSizeOnDisk": 0,
          "downloadUrl": "string",
          "gameVersions": [
            "string"
          ],
          "sortableGameVersions": [
            {
              "gameVersionName": "string",
              "gameVersionPadded": "string",
              "gameVersion": "string",
              "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
              "gameVersionTypeId": 0
            }
          ],
          "dependencies": [
            {
              "modId": 0,
              "relationType": 1
            }
          ],
          "exposeAsAlternative": true,
          "parentProjectFileId": 0,
          "alternateFileId": 0,
          "isServerPack": true,
          "serverPackFileId": 0,
          "isEarlyAccessContent": true,
          "earlyAccessEndDate": "2019-08-24T14:15:22Z",
          "fileFingerprint": 0,
          "modules": [
            {
              "name": "string",
              "fingerprint": 0
            }
          ]
        }
      ],
      "latestFilesIndexes": [
        {
          "gameVersion": "string",
          "fileId": 0,
          "filename": "string",
          "releaseType": 1,
          "gameVersionTypeId": 0,
          "modLoader": 0
        }
      ],
      "latestEarlyAccessFilesIndexes": [
        {
          "gameVersion": "string",
          "fileId": 0,
          "filename": "string",
          "releaseType": 1,
          "gameVersionTypeId": 0,
          "modLoader": 0
        }
      ],
      "dateCreated": "2019-08-24T14:15:22Z",
      "dateModified": "2019-08-24T14:15:22Z",
      "dateReleased": "2019-08-24T14:15:22Z",
      "allowModDistribution": true,
      "gamePopularityRank": 0,
      "isAvailable": true,
      "thumbsUpCount": 0,
      "rating": 0
    }
  ],
  "recentlyUpdated": [
    {
      "id": 0,
      "gameId": 0,
      "name": "string",
      "slug": "string",
      "links": {
        "websiteUrl": "string",
        "wikiUrl": "string",
        "issuesUrl": "string",
        "sourceUrl": "string"
      },
      "summary": "string",
      "status": 1,
      "downloadCount": 0,
      "isFeatured": true,
      "primaryCategoryId": 0,
      "categories": [
        {
          "id": 0,
          "gameId": 0,
          "name": "string",
          "slug": "string",
          "url": "string",
          "iconUrl": "string",
          "dateModified": "2019-08-24T14:15:22Z",
          "isClass": true,
          "classId": 0,
          "parentCategoryId": 0,
          "displayIndex": 0
        }
      ],
      "classId": 0,
      "authors": [
        {
          "id": 0,
          "name": "string",
          "url": "string"
        }
      ],
      "logo": {
        "id": 0,
        "modId": 0,
        "title": "string",
        "description": "string",
        "thumbnailUrl": "string",
        "url": "string"
      },
      "screenshots": [
        {
          "id": 0,
          "modId": 0,
          "title": "string",
          "description": "string",
          "thumbnailUrl": "string",
          "url": "string"
        }
      ],
      "mainFileId": 0,
      "latestFiles": [
        {
          "id": 0,
          "gameId": 0,
          "modId": 0,
          "isAvailable": true,
          "displayName": "string",
          "fileName": "string",
          "releaseType": 1,
          "fileStatus": 1,
          "hashes": [
            {
              "value": "string",
              "algo": 1
            }
          ],
          "fileDate": "2019-08-24T14:15:22Z",
          "fileLength": 0,
          "downloadCount": 0,
          "fileSizeOnDisk": 0,
          "downloadUrl": "string",
          "gameVersions": [
            "string"
          ],
          "sortableGameVersions": [
            {
              "gameVersionName": "string",
              "gameVersionPadded": "string",
              "gameVersion": "string",
              "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
              "gameVersionTypeId": 0
            }
          ],
          "dependencies": [
            {
              "modId": 0,
              "relationType": 1
            }
          ],
          "exposeAsAlternative": true,
          "parentProjectFileId": 0,
          "alternateFileId": 0,
          "isServerPack": true,
          "serverPackFileId": 0,
          "isEarlyAccessContent": true,
          "earlyAccessEndDate": "2019-08-24T14:15:22Z",
          "fileFingerprint": 0,
          "modules": [
            {
              "name": "string",
              "fingerprint": 0
            }
          ]
        }
      ],
      "latestFilesIndexes": [
        {
          "gameVersion": "string",
          "fileId": 0,
          "filename": "string",
          "releaseType": 1,
          "gameVersionTypeId": 0,
          "modLoader": 0
        }
      ],
      "latestEarlyAccessFilesIndexes": [
        {
          "gameVersion": "string",
          "fileId": 0,
          "filename": "string",
          "releaseType": 1,
          "gameVersionTypeId": 0,
          "modLoader": 0
        }
      ],
      "dateCreated": "2019-08-24T14:15:22Z",
      "dateModified": "2019-08-24T14:15:22Z",
      "dateReleased": "2019-08-24T14:15:22Z",
      "allowModDistribution": true,
      "gamePopularityRank": 0,
      "isAvailable": true,
      "thumbsUpCount": 0,
      "rating": 0
    }
  ]
}

Properties
Name	Type	Description
featured	[Mod]	none
popular	[Mod]	none
recentlyUpdated	[Mod]	none
File

{
  "id": 0,
  "gameId": 0,
  "modId": 0,
  "isAvailable": true,
  "displayName": "string",
  "fileName": "string",
  "releaseType": 1,
  "fileStatus": 1,
  "hashes": [
    {
      "value": "string",
      "algo": 1
    }
  ],
  "fileDate": "2019-08-24T14:15:22Z",
  "fileLength": 0,
  "downloadCount": 0,
  "fileSizeOnDisk": 0,
  "downloadUrl": "string",
  "gameVersions": [
    "string"
  ],
  "sortableGameVersions": [
    {
      "gameVersionName": "string",
      "gameVersionPadded": "string",
      "gameVersion": "string",
      "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
      "gameVersionTypeId": 0
    }
  ],
  "dependencies": [
    {
      "modId": 0,
      "relationType": 1
    }
  ],
  "exposeAsAlternative": true,
  "parentProjectFileId": 0,
  "alternateFileId": 0,
  "isServerPack": true,
  "serverPackFileId": 0,
  "isEarlyAccessContent": true,
  "earlyAccessEndDate": "2019-08-24T14:15:22Z",
  "fileFingerprint": 0,
  "modules": [
    {
      "name": "string",
      "fingerprint": 0
    }
  ]
}

Properties
Name	Type	Description
id	integer(int32)	The file id
gameId	integer(int32)	The game id related to the mod that this file belongs to
modId	integer(int32)	The mod id
isAvailable	boolean	Whether the file is available to download
displayName	string	Display name of the file
fileName	string	Exact file name
releaseType	FileReleaseType	The file release type
fileStatus	FileStatus	Status of the file
hashes	[FileHash]	The file hash (i.e. md5 or sha1)
fileDate	string(date-time)	The file timestamp
fileLength	integer(int64)	The file length in bytes
downloadCount	integer(int64)	The number of downloads for the file
fileSizeOnDisk	integer(int64)¦null	The file's size on disk
downloadUrl	string	The file download URL
gameVersions	[string]	List of game versions this file is relevant for
sortableGameVersions	[SortableGameVersion]	Metadata used for sorting by game versions
dependencies	[FileDependency]	List of dependencies files
exposeAsAlternative	boolean¦null	none
parentProjectFileId	integer(int32)¦null	none
alternateFileId	integer(int32)¦null	none
isServerPack	boolean¦null	none
serverPackFileId	integer(int32)¦null	none
isEarlyAccessContent	boolean¦null	none
earlyAccessEndDate	string(date-time)¦null	none
fileFingerprint	integer(int64)	none
modules	[FileModule]	none
FileDependency

{
  "modId": 0,
  "relationType": 1
}

Properties
Name	Type	Description
modId	integer(int32)	none
relationType	FileRelationType	1 = EmbeddedLibrary
2 = OptionalDependency
3 = RequiredDependency
4 = Tool
5 = Incompatible
6 = Include
FileHash

{
  "value": "string",
  "algo": 1
}

Properties
Name	Type	Description
value	string	none
algo	HashAlgo	1 = Sha1
2 = Md5
FileIndex

{
  "gameVersion": "string",
  "fileId": 0,
  "filename": "string",
  "releaseType": 1,
  "gameVersionTypeId": 0,
  "modLoader": 0
}

Properties
Name	Type	Description
gameVersion	string	none
fileId	integer(int32)	none
filename	string	none
releaseType	FileReleaseType	1 = Release
2 = Beta
3 = Alpha
gameVersionTypeId	integer(int32)¦null	none
modLoader	ModLoaderType	0 = Any
1 = Forge
2 = Cauldron
3 = LiteLoader
4 = Fabric
5 = Quilt
6 = NeoForge
FileModule

{
  "name": "string",
  "fingerprint": 0
}

Properties
Name	Type	Description
name	string	none
fingerprint	integer(int64)	none
FileRelationType

1

Possible enum values:

1=EmbeddedLibrary

2=OptionalDependency

3=RequiredDependency

4=Tool

5=Incompatible

6=Include

FileReleaseType

1

Possible enum values:

1=Release

2=Beta

3=Alpha

FileStatus

1

Possible enum values:

1=Processing

2=ChangesRequired

3=UnderReview

4=Approved

5=Rejected

6=MalwareDetected

7=Deleted

8=Archived

9=Testing

10=Released

11=ReadyForReview

12=Deprecated

13=Baking

14=AwaitingPublishing

15=FailedPublishing

16=Cooking

17=Cooked

18=UnderManualReview

19=ScanningForMalware

20=ProcessingFile

21=PendingRelease

22=ReadyForCooking

23=PostProcessing

FingerprintFuzzyMatch

{
  "id": 0,
  "file": {
    "id": 0,
    "gameId": 0,
    "modId": 0,
    "isAvailable": true,
    "displayName": "string",
    "fileName": "string",
    "releaseType": 1,
    "fileStatus": 1,
    "hashes": [
      {
        "value": "string",
        "algo": 1
      }
    ],
    "fileDate": "2019-08-24T14:15:22Z",
    "fileLength": 0,
    "downloadCount": 0,
    "fileSizeOnDisk": 0,
    "downloadUrl": "string",
    "gameVersions": [
      "string"
    ],
    "sortableGameVersions": [
      {
        "gameVersionName": "string",
        "gameVersionPadded": "string",
        "gameVersion": "string",
        "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
        "gameVersionTypeId": 0
      }
    ],
    "dependencies": [
      {
        "modId": 0,
        "relationType": 1
      }
    ],
    "exposeAsAlternative": true,
    "parentProjectFileId": 0,
    "alternateFileId": 0,
    "isServerPack": true,
    "serverPackFileId": 0,
    "isEarlyAccessContent": true,
    "earlyAccessEndDate": "2019-08-24T14:15:22Z",
    "fileFingerprint": 0,
    "modules": [
      {
        "name": "string",
        "fingerprint": 0
      }
    ]
  },
  "latestFiles": [
    {
      "id": 0,
      "gameId": 0,
      "modId": 0,
      "isAvailable": true,
      "displayName": "string",
      "fileName": "string",
      "releaseType": 1,
      "fileStatus": 1,
      "hashes": [
        {
          "value": "string",
          "algo": 1
        }
      ],
      "fileDate": "2019-08-24T14:15:22Z",
      "fileLength": 0,
      "downloadCount": 0,
      "fileSizeOnDisk": 0,
      "downloadUrl": "string",
      "gameVersions": [
        "string"
      ],
      "sortableGameVersions": [
        {
          "gameVersionName": "string",
          "gameVersionPadded": "string",
          "gameVersion": "string",
          "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
          "gameVersionTypeId": 0
        }
      ],
      "dependencies": [
        {
          "modId": 0,
          "relationType": 1
        }
      ],
      "exposeAsAlternative": true,
      "parentProjectFileId": 0,
      "alternateFileId": 0,
      "isServerPack": true,
      "serverPackFileId": 0,
      "isEarlyAccessContent": true,
      "earlyAccessEndDate": "2019-08-24T14:15:22Z",
      "fileFingerprint": 0,
      "modules": [
        {
          "name": "string",
          "fingerprint": 0
        }
      ]
    }
  ],
  "fingerprints": [
    0
  ]
}

Properties
Name	Type	Description
id	integer(int32)	none
file	File	none
latestFiles	[File]	none
fingerprints	[integer]	none
FingerprintFuzzyMatchResult

{
  "fuzzyMatches": [
    {
      "id": 0,
      "file": {
        "id": 0,
        "gameId": 0,
        "modId": 0,
        "isAvailable": true,
        "displayName": "string",
        "fileName": "string",
        "releaseType": 1,
        "fileStatus": 1,
        "hashes": [
          {
            "value": "string",
            "algo": 1
          }
        ],
        "fileDate": "2019-08-24T14:15:22Z",
        "fileLength": 0,
        "downloadCount": 0,
        "fileSizeOnDisk": 0,
        "downloadUrl": "string",
        "gameVersions": [
          "string"
        ],
        "sortableGameVersions": [
          {
            "gameVersionName": "string",
            "gameVersionPadded": "string",
            "gameVersion": "string",
            "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
            "gameVersionTypeId": 0
          }
        ],
        "dependencies": [
          {
            "modId": 0,
            "relationType": 1
          }
        ],
        "exposeAsAlternative": true,
        "parentProjectFileId": 0,
        "alternateFileId": 0,
        "isServerPack": true,
        "serverPackFileId": 0,
        "isEarlyAccessContent": true,
        "earlyAccessEndDate": "2019-08-24T14:15:22Z",
        "fileFingerprint": 0,
        "modules": [
          {
            "name": "string",
            "fingerprint": 0
          }
        ]
      },
      "latestFiles": [
        {
          "id": 0,
          "gameId": 0,
          "modId": 0,
          "isAvailable": true,
          "displayName": "string",
          "fileName": "string",
          "releaseType": 1,
          "fileStatus": 1,
          "hashes": [
            {
              "value": "string",
              "algo": 1
            }
          ],
          "fileDate": "2019-08-24T14:15:22Z",
          "fileLength": 0,
          "downloadCount": 0,
          "fileSizeOnDisk": 0,
          "downloadUrl": "string",
          "gameVersions": [
            "string"
          ],
          "sortableGameVersions": [
            {
              "gameVersionName": "string",
              "gameVersionPadded": "string",
              "gameVersion": "string",
              "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
              "gameVersionTypeId": 0
            }
          ],
          "dependencies": [
            {
              "modId": 0,
              "relationType": 1
            }
          ],
          "exposeAsAlternative": true,
          "parentProjectFileId": 0,
          "alternateFileId": 0,
          "isServerPack": true,
          "serverPackFileId": 0,
          "isEarlyAccessContent": true,
          "earlyAccessEndDate": "2019-08-24T14:15:22Z",
          "fileFingerprint": 0,
          "modules": [
            {
              "name": "string",
              "fingerprint": 0
            }
          ]
        }
      ],
      "fingerprints": [
        0
      ]
    }
  ]
}

Properties
Name	Type	Description
fuzzyMatches	[FingerprintFuzzyMatch]	none
FingerprintMatch

{
  "id": 0,
  "file": {
    "id": 0,
    "gameId": 0,
    "modId": 0,
    "isAvailable": true,
    "displayName": "string",
    "fileName": "string",
    "releaseType": 1,
    "fileStatus": 1,
    "hashes": [
      {
        "value": "string",
        "algo": 1
      }
    ],
    "fileDate": "2019-08-24T14:15:22Z",
    "fileLength": 0,
    "downloadCount": 0,
    "fileSizeOnDisk": 0,
    "downloadUrl": "string",
    "gameVersions": [
      "string"
    ],
    "sortableGameVersions": [
      {
        "gameVersionName": "string",
        "gameVersionPadded": "string",
        "gameVersion": "string",
        "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
        "gameVersionTypeId": 0
      }
    ],
    "dependencies": [
      {
        "modId": 0,
        "relationType": 1
      }
    ],
    "exposeAsAlternative": true,
    "parentProjectFileId": 0,
    "alternateFileId": 0,
    "isServerPack": true,
    "serverPackFileId": 0,
    "isEarlyAccessContent": true,
    "earlyAccessEndDate": "2019-08-24T14:15:22Z",
    "fileFingerprint": 0,
    "modules": [
      {
        "name": "string",
        "fingerprint": 0
      }
    ]
  },
  "latestFiles": [
    {
      "id": 0,
      "gameId": 0,
      "modId": 0,
      "isAvailable": true,
      "displayName": "string",
      "fileName": "string",
      "releaseType": 1,
      "fileStatus": 1,
      "hashes": [
        {
          "value": "string",
          "algo": 1
        }
      ],
      "fileDate": "2019-08-24T14:15:22Z",
      "fileLength": 0,
      "downloadCount": 0,
      "fileSizeOnDisk": 0,
      "downloadUrl": "string",
      "gameVersions": [
        "string"
      ],
      "sortableGameVersions": [
        {
          "gameVersionName": "string",
          "gameVersionPadded": "string",
          "gameVersion": "string",
          "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
          "gameVersionTypeId": 0
        }
      ],
      "dependencies": [
        {
          "modId": 0,
          "relationType": 1
        }
      ],
      "exposeAsAlternative": true,
      "parentProjectFileId": 0,
      "alternateFileId": 0,
      "isServerPack": true,
      "serverPackFileId": 0,
      "isEarlyAccessContent": true,
      "earlyAccessEndDate": "2019-08-24T14:15:22Z",
      "fileFingerprint": 0,
      "modules": [
        {
          "name": "string",
          "fingerprint": 0
        }
      ]
    }
  ]
}

Properties
Name	Type	Description
id	integer(int32)	none
file	File	none
latestFiles	[File]	none
FingerprintsMatchesResult

{
  "isCacheBuilt": true,
  "exactMatches": [
    {
      "id": 0,
      "file": {
        "id": 0,
        "gameId": 0,
        "modId": 0,
        "isAvailable": true,
        "displayName": "string",
        "fileName": "string",
        "releaseType": 1,
        "fileStatus": 1,
        "hashes": [
          {
            "value": "string",
            "algo": 1
          }
        ],
        "fileDate": "2019-08-24T14:15:22Z",
        "fileLength": 0,
        "downloadCount": 0,
        "fileSizeOnDisk": 0,
        "downloadUrl": "string",
        "gameVersions": [
          "string"
        ],
        "sortableGameVersions": [
          {
            "gameVersionName": "string",
            "gameVersionPadded": "string",
            "gameVersion": "string",
            "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
            "gameVersionTypeId": 0
          }
        ],
        "dependencies": [
          {
            "modId": 0,
            "relationType": 1
          }
        ],
        "exposeAsAlternative": true,
        "parentProjectFileId": 0,
        "alternateFileId": 0,
        "isServerPack": true,
        "serverPackFileId": 0,
        "isEarlyAccessContent": true,
        "earlyAccessEndDate": "2019-08-24T14:15:22Z",
        "fileFingerprint": 0,
        "modules": [
          {
            "name": "string",
            "fingerprint": 0
          }
        ]
      },
      "latestFiles": [
        {
          "id": 0,
          "gameId": 0,
          "modId": 0,
          "isAvailable": true,
          "displayName": "string",
          "fileName": "string",
          "releaseType": 1,
          "fileStatus": 1,
          "hashes": [
            {
              "value": "string",
              "algo": 1
            }
          ],
          "fileDate": "2019-08-24T14:15:22Z",
          "fileLength": 0,
          "downloadCount": 0,
          "fileSizeOnDisk": 0,
          "downloadUrl": "string",
          "gameVersions": [
            "string"
          ],
          "sortableGameVersions": [
            {
              "gameVersionName": "string",
              "gameVersionPadded": "string",
              "gameVersion": "string",
              "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
              "gameVersionTypeId": 0
            }
          ],
          "dependencies": [
            {
              "modId": 0,
              "relationType": 1
            }
          ],
          "exposeAsAlternative": true,
          "parentProjectFileId": 0,
          "alternateFileId": 0,
          "isServerPack": true,
          "serverPackFileId": 0,
          "isEarlyAccessContent": true,
          "earlyAccessEndDate": "2019-08-24T14:15:22Z",
          "fileFingerprint": 0,
          "modules": [
            {
              "name": "string",
              "fingerprint": 0
            }
          ]
        }
      ]
    }
  ],
  "exactFingerprints": [
    0
  ],
  "partialMatches": [
    {
      "id": 0,
      "file": {
        "id": 0,
        "gameId": 0,
        "modId": 0,
        "isAvailable": true,
        "displayName": "string",
        "fileName": "string",
        "releaseType": 1,
        "fileStatus": 1,
        "hashes": [
          {
            "value": "string",
            "algo": 1
          }
        ],
        "fileDate": "2019-08-24T14:15:22Z",
        "fileLength": 0,
        "downloadCount": 0,
        "fileSizeOnDisk": 0,
        "downloadUrl": "string",
        "gameVersions": [
          "string"
        ],
        "sortableGameVersions": [
          {
            "gameVersionName": "string",
            "gameVersionPadded": "string",
            "gameVersion": "string",
            "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
            "gameVersionTypeId": 0
          }
        ],
        "dependencies": [
          {
            "modId": 0,
            "relationType": 1
          }
        ],
        "exposeAsAlternative": true,
        "parentProjectFileId": 0,
        "alternateFileId": 0,
        "isServerPack": true,
        "serverPackFileId": 0,
        "isEarlyAccessContent": true,
        "earlyAccessEndDate": "2019-08-24T14:15:22Z",
        "fileFingerprint": 0,
        "modules": [
          {
            "name": "string",
            "fingerprint": 0
          }
        ]
      },
      "latestFiles": [
        {
          "id": 0,
          "gameId": 0,
          "modId": 0,
          "isAvailable": true,
          "displayName": "string",
          "fileName": "string",
          "releaseType": 1,
          "fileStatus": 1,
          "hashes": [
            {
              "value": "string",
              "algo": 1
            }
          ],
          "fileDate": "2019-08-24T14:15:22Z",
          "fileLength": 0,
          "downloadCount": 0,
          "fileSizeOnDisk": 0,
          "downloadUrl": "string",
          "gameVersions": [
            "string"
          ],
          "sortableGameVersions": [
            {
              "gameVersionName": "string",
              "gameVersionPadded": "string",
              "gameVersion": "string",
              "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
              "gameVersionTypeId": 0
            }
          ],
          "dependencies": [
            {
              "modId": 0,
              "relationType": 1
            }
          ],
          "exposeAsAlternative": true,
          "parentProjectFileId": 0,
          "alternateFileId": 0,
          "isServerPack": true,
          "serverPackFileId": 0,
          "isEarlyAccessContent": true,
          "earlyAccessEndDate": "2019-08-24T14:15:22Z",
          "fileFingerprint": 0,
          "modules": [
            {
              "name": "string",
              "fingerprint": 0
            }
          ]
        }
      ]
    }
  ],
  "partialMatchFingerprints": {
    "property1": [
      0
    ],
    "property2": [
      0
    ]
  },
  "installedFingerprints": [
    0
  ],
  "unmatchedFingerprints": [
    0
  ]
}

Properties
Name	Type	Description
isCacheBuilt	boolean	none
exactMatches	[FingerprintMatch]	none
exactFingerprints	[integer]	none
partialMatches	[FingerprintMatch]	none
partialMatchFingerprints	object	none
» additionalProperties	[integer]	none
installedFingerprints	[integer]	none
unmatchedFingerprints	[integer]	none
FolderFingerprint

{
  "foldername": "string",
  "fingerprints": [
    0
  ]
}

Properties
Name	Type	Description
foldername	string	none
fingerprints	[integer]	none
Game

{
  "id": 0,
  "name": "string",
  "slug": "string",
  "dateModified": "2019-08-24T14:15:22Z",
  "assets": {
    "iconUrl": "string",
    "tileUrl": "string",
    "coverUrl": "string"
  },
  "status": 1,
  "apiStatus": 1
}

Properties
Name	Type	Description
id	integer(int32)	none
name	string	none
slug	string	none
dateModified	string(date-time)	none
assets	GameAssets	none
status	CoreStatus	1 = Draft
2 = Test
3 = PendingReview
4 = Rejected
5 = Approved
6 = Live
apiStatus	CoreApiStatus	1 = Private
2 = Public
GameAssets

{
  "iconUrl": "string",
  "tileUrl": "string",
  "coverUrl": "string"
}

Properties
Name	Type	Description
iconUrl	string	none
tileUrl	string	none
coverUrl	string	none
GameVersion

{
  "id": 0,
  "slug": "string",
  "name": "string"
}

Properties
Name	Type	Description
id	integer(int32)	none
slug	string	none
name	string	none
GameVersionsByType

{
  "type": 0,
  "versions": [
    "string"
  ]
}

Properties
Name	Type	Description
type	integer(int32)	none
versions	[string]	none
GameVersionsByType2

{
  "type": 0,
  "versions": [
    {
      "id": 0,
      "slug": "string",
      "name": "string"
    }
  ]
}

Properties
Name	Type	Description
type	integer(int32)	none
versions	[GameVersion]	none
GameVersionStatus

1

Possible enum values:

1=Approved

2=Deleted

3=New

GameVersionType

{
  "id": 0,
  "gameId": 0,
  "name": "string",
  "slug": "string",
  "isSyncable": true,
  "status": 1
}

Properties
Name	Type	Description
id	integer(int32)	none
gameId	integer(int32)	none
name	string	none
slug	string	none
isSyncable	boolean	none
status	GameVersionTypeStatus	1 = Normal
2 = Deleted
GameVersionTypeStatus

1

Possible enum values:

1=Normal

2=Deleted

Get Categories Response

{
  "data": [
    {
      "id": 0,
      "gameId": 0,
      "name": "string",
      "slug": "string",
      "url": "string",
      "iconUrl": "string",
      "dateModified": "2019-08-24T14:15:22Z",
      "isClass": true,
      "classId": 0,
      "parentCategoryId": 0,
      "displayIndex": 0
    }
  ]
}

Properties
Name	Type	Description
data	[Category]	The response data
Get Featured Mods Response

{
  "data": {
    "featured": [
      {
        "id": 0,
        "gameId": 0,
        "name": "string",
        "slug": "string",
        "links": {
          "websiteUrl": "string",
          "wikiUrl": "string",
          "issuesUrl": "string",
          "sourceUrl": "string"
        },
        "summary": "string",
        "status": 1,
        "downloadCount": 0,
        "isFeatured": true,
        "primaryCategoryId": 0,
        "categories": [
          {
            "id": 0,
            "gameId": 0,
            "name": "string",
            "slug": "string",
            "url": "string",
            "iconUrl": "string",
            "dateModified": "2019-08-24T14:15:22Z",
            "isClass": true,
            "classId": 0,
            "parentCategoryId": 0,
            "displayIndex": 0
          }
        ],
        "classId": 0,
        "authors": [
          {
            "id": 0,
            "name": "string",
            "url": "string"
          }
        ],
        "logo": {
          "id": 0,
          "modId": 0,
          "title": "string",
          "description": "string",
          "thumbnailUrl": "string",
          "url": "string"
        },
        "screenshots": [
          {
            "id": 0,
            "modId": 0,
            "title": "string",
            "description": "string",
            "thumbnailUrl": "string",
            "url": "string"
          }
        ],
        "mainFileId": 0,
        "latestFiles": [
          {
            "id": 0,
            "gameId": 0,
            "modId": 0,
            "isAvailable": true,
            "displayName": "string",
            "fileName": "string",
            "releaseType": 1,
            "fileStatus": 1,
            "hashes": [
              {
                "value": "string",
                "algo": 1
              }
            ],
            "fileDate": "2019-08-24T14:15:22Z",
            "fileLength": 0,
            "downloadCount": 0,
            "fileSizeOnDisk": 0,
            "downloadUrl": "string",
            "gameVersions": [
              "string"
            ],
            "sortableGameVersions": [
              {
                "gameVersionName": "string",
                "gameVersionPadded": "string",
                "gameVersion": "string",
                "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
                "gameVersionTypeId": 0
              }
            ],
            "dependencies": [
              {
                "modId": 0,
                "relationType": 1
              }
            ],
            "exposeAsAlternative": true,
            "parentProjectFileId": 0,
            "alternateFileId": 0,
            "isServerPack": true,
            "serverPackFileId": 0,
            "isEarlyAccessContent": true,
            "earlyAccessEndDate": "2019-08-24T14:15:22Z",
            "fileFingerprint": 0,
            "modules": [
              {
                "name": "string",
                "fingerprint": 0
              }
            ]
          }
        ],
        "latestFilesIndexes": [
          {
            "gameVersion": "string",
            "fileId": 0,
            "filename": "string",
            "releaseType": 1,
            "gameVersionTypeId": 0,
            "modLoader": 0
          }
        ],
        "latestEarlyAccessFilesIndexes": [
          {
            "gameVersion": "string",
            "fileId": 0,
            "filename": "string",
            "releaseType": 1,
            "gameVersionTypeId": 0,
            "modLoader": 0
          }
        ],
        "dateCreated": "2019-08-24T14:15:22Z",
        "dateModified": "2019-08-24T14:15:22Z",
        "dateReleased": "2019-08-24T14:15:22Z",
        "allowModDistribution": true,
        "gamePopularityRank": 0,
        "isAvailable": true,
        "thumbsUpCount": 0,
        "rating": 0
      }
    ],
    "popular": [
      {
        "id": 0,
        "gameId": 0,
        "name": "string",
        "slug": "string",
        "links": {
          "websiteUrl": "string",
          "wikiUrl": "string",
          "issuesUrl": "string",
          "sourceUrl": "string"
        },
        "summary": "string",
        "status": 1,
        "downloadCount": 0,
        "isFeatured": true,
        "primaryCategoryId": 0,
        "categories": [
          {
            "id": 0,
            "gameId": 0,
            "name": "string",
            "slug": "string",
            "url": "string",
            "iconUrl": "string",
            "dateModified": "2019-08-24T14:15:22Z",
            "isClass": true,
            "classId": 0,
            "parentCategoryId": 0,
            "displayIndex": 0
          }
        ],
        "classId": 0,
        "authors": [
          {
            "id": 0,
            "name": "string",
            "url": "string"
          }
        ],
        "logo": {
          "id": 0,
          "modId": 0,
          "title": "string",
          "description": "string",
          "thumbnailUrl": "string",
          "url": "string"
        },
        "screenshots": [
          {
            "id": 0,
            "modId": 0,
            "title": "string",
            "description": "string",
            "thumbnailUrl": "string",
            "url": "string"
          }
        ],
        "mainFileId": 0,
        "latestFiles": [
          {
            "id": 0,
            "gameId": 0,
            "modId": 0,
            "isAvailable": true,
            "displayName": "string",
            "fileName": "string",
            "releaseType": 1,
            "fileStatus": 1,
            "hashes": [
              {
                "value": "string",
                "algo": 1
              }
            ],
            "fileDate": "2019-08-24T14:15:22Z",
            "fileLength": 0,
            "downloadCount": 0,
            "fileSizeOnDisk": 0,
            "downloadUrl": "string",
            "gameVersions": [
              "string"
            ],
            "sortableGameVersions": [
              {
                "gameVersionName": "string",
                "gameVersionPadded": "string",
                "gameVersion": "string",
                "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
                "gameVersionTypeId": 0
              }
            ],
            "dependencies": [
              {
                "modId": 0,
                "relationType": 1
              }
            ],
            "exposeAsAlternative": true,
            "parentProjectFileId": 0,
            "alternateFileId": 0,
            "isServerPack": true,
            "serverPackFileId": 0,
            "isEarlyAccessContent": true,
            "earlyAccessEndDate": "2019-08-24T14:15:22Z",
            "fileFingerprint": 0,
            "modules": [
              {
                "name": "string",
                "fingerprint": 0
              }
            ]
          }
        ],
        "latestFilesIndexes": [
          {
            "gameVersion": "string",
            "fileId": 0,
            "filename": "string",
            "releaseType": 1,
            "gameVersionTypeId": 0,
            "modLoader": 0
          }
        ],
        "latestEarlyAccessFilesIndexes": [
          {
            "gameVersion": "string",
            "fileId": 0,
            "filename": "string",
            "releaseType": 1,
            "gameVersionTypeId": 0,
            "modLoader": 0
          }
        ],
        "dateCreated": "2019-08-24T14:15:22Z",
        "dateModified": "2019-08-24T14:15:22Z",
        "dateReleased": "2019-08-24T14:15:22Z",
        "allowModDistribution": true,
        "gamePopularityRank": 0,
        "isAvailable": true,
        "thumbsUpCount": 0,
        "rating": 0
      }
    ],
    "recentlyUpdated": [
      {
        "id": 0,
        "gameId": 0,
        "name": "string",
        "slug": "string",
        "links": {
          "websiteUrl": "string",
          "wikiUrl": "string",
          "issuesUrl": "string",
          "sourceUrl": "string"
        },
        "summary": "string",
        "status": 1,
        "downloadCount": 0,
        "isFeatured": true,
        "primaryCategoryId": 0,
        "categories": [
          {
            "id": 0,
            "gameId": 0,
            "name": "string",
            "slug": "string",
            "url": "string",
            "iconUrl": "string",
            "dateModified": "2019-08-24T14:15:22Z",
            "isClass": true,
            "classId": 0,
            "parentCategoryId": 0,
            "displayIndex": 0
          }
        ],
        "classId": 0,
        "authors": [
          {
            "id": 0,
            "name": "string",
            "url": "string"
          }
        ],
        "logo": {
          "id": 0,
          "modId": 0,
          "title": "string",
          "description": "string",
          "thumbnailUrl": "string",
          "url": "string"
        },
        "screenshots": [
          {
            "id": 0,
            "modId": 0,
            "title": "string",
            "description": "string",
            "thumbnailUrl": "string",
            "url": "string"
          }
        ],
        "mainFileId": 0,
        "latestFiles": [
          {
            "id": 0,
            "gameId": 0,
            "modId": 0,
            "isAvailable": true,
            "displayName": "string",
            "fileName": "string",
            "releaseType": 1,
            "fileStatus": 1,
            "hashes": [
              {
                "value": "string",
                "algo": 1
              }
            ],
            "fileDate": "2019-08-24T14:15:22Z",
            "fileLength": 0,
            "downloadCount": 0,
            "fileSizeOnDisk": 0,
            "downloadUrl": "string",
            "gameVersions": [
              "string"
            ],
            "sortableGameVersions": [
              {
                "gameVersionName": "string",
                "gameVersionPadded": "string",
                "gameVersion": "string",
                "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
                "gameVersionTypeId": 0
              }
            ],
            "dependencies": [
              {
                "modId": 0,
                "relationType": 1
              }
            ],
            "exposeAsAlternative": true,
            "parentProjectFileId": 0,
            "alternateFileId": 0,
            "isServerPack": true,
            "serverPackFileId": 0,
            "isEarlyAccessContent": true,
            "earlyAccessEndDate": "2019-08-24T14:15:22Z",
            "fileFingerprint": 0,
            "modules": [
              {
                "name": "string",
                "fingerprint": 0
              }
            ]
          }
        ],
        "latestFilesIndexes": [
          {
            "gameVersion": "string",
            "fileId": 0,
            "filename": "string",
            "releaseType": 1,
            "gameVersionTypeId": 0,
            "modLoader": 0
          }
        ],
        "latestEarlyAccessFilesIndexes": [
          {
            "gameVersion": "string",
            "fileId": 0,
            "filename": "string",
            "releaseType": 1,
            "gameVersionTypeId": 0,
            "modLoader": 0
          }
        ],
        "dateCreated": "2019-08-24T14:15:22Z",
        "dateModified": "2019-08-24T14:15:22Z",
        "dateReleased": "2019-08-24T14:15:22Z",
        "allowModDistribution": true,
        "gamePopularityRank": 0,
        "isAvailable": true,
        "thumbsUpCount": 0,
        "rating": 0
      }
    ]
  }
}

Properties
Name	Type	Description
data	FeaturedModsResponse	The response data
Get Files Response

{
  "data": [
    {
      "id": 0,
      "gameId": 0,
      "modId": 0,
      "isAvailable": true,
      "displayName": "string",
      "fileName": "string",
      "releaseType": 1,
      "fileStatus": 1,
      "hashes": [
        {
          "value": "string",
          "algo": 1
        }
      ],
      "fileDate": "2019-08-24T14:15:22Z",
      "fileLength": 0,
      "downloadCount": 0,
      "fileSizeOnDisk": 0,
      "downloadUrl": "string",
      "gameVersions": [
        "string"
      ],
      "sortableGameVersions": [
        {
          "gameVersionName": "string",
          "gameVersionPadded": "string",
          "gameVersion": "string",
          "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
          "gameVersionTypeId": 0
        }
      ],
      "dependencies": [
        {
          "modId": 0,
          "relationType": 1
        }
      ],
      "exposeAsAlternative": true,
      "parentProjectFileId": 0,
      "alternateFileId": 0,
      "isServerPack": true,
      "serverPackFileId": 0,
      "isEarlyAccessContent": true,
      "earlyAccessEndDate": "2019-08-24T14:15:22Z",
      "fileFingerprint": 0,
      "modules": [
        {
          "name": "string",
          "fingerprint": 0
        }
      ]
    }
  ]
}

Properties
Name	Type	Description
data	[File]	The response data
Get Fingerprint Matches Response

{
  "data": {
    "isCacheBuilt": true,
    "exactMatches": [
      {
        "id": 0,
        "file": {
          "id": 0,
          "gameId": 0,
          "modId": 0,
          "isAvailable": true,
          "displayName": "string",
          "fileName": "string",
          "releaseType": 1,
          "fileStatus": 1,
          "hashes": [
            {
              "value": "string",
              "algo": 1
            }
          ],
          "fileDate": "2019-08-24T14:15:22Z",
          "fileLength": 0,
          "downloadCount": 0,
          "fileSizeOnDisk": 0,
          "downloadUrl": "string",
          "gameVersions": [
            "string"
          ],
          "sortableGameVersions": [
            {
              "gameVersionName": "string",
              "gameVersionPadded": "string",
              "gameVersion": "string",
              "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
              "gameVersionTypeId": 0
            }
          ],
          "dependencies": [
            {
              "modId": 0,
              "relationType": 1
            }
          ],
          "exposeAsAlternative": true,
          "parentProjectFileId": 0,
          "alternateFileId": 0,
          "isServerPack": true,
          "serverPackFileId": 0,
          "isEarlyAccessContent": true,
          "earlyAccessEndDate": "2019-08-24T14:15:22Z",
          "fileFingerprint": 0,
          "modules": [
            {
              "name": "string",
              "fingerprint": 0
            }
          ]
        },
        "latestFiles": [
          {
            "id": 0,
            "gameId": 0,
            "modId": 0,
            "isAvailable": true,
            "displayName": "string",
            "fileName": "string",
            "releaseType": 1,
            "fileStatus": 1,
            "hashes": [
              {
                "value": "string",
                "algo": 1
              }
            ],
            "fileDate": "2019-08-24T14:15:22Z",
            "fileLength": 0,
            "downloadCount": 0,
            "fileSizeOnDisk": 0,
            "downloadUrl": "string",
            "gameVersions": [
              "string"
            ],
            "sortableGameVersions": [
              {
                "gameVersionName": "string",
                "gameVersionPadded": "string",
                "gameVersion": "string",
                "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
                "gameVersionTypeId": 0
              }
            ],
            "dependencies": [
              {
                "modId": 0,
                "relationType": 1
              }
            ],
            "exposeAsAlternative": true,
            "parentProjectFileId": 0,
            "alternateFileId": 0,
            "isServerPack": true,
            "serverPackFileId": 0,
            "isEarlyAccessContent": true,
            "earlyAccessEndDate": "2019-08-24T14:15:22Z",
            "fileFingerprint": 0,
            "modules": [
              {
                "name": "string",
                "fingerprint": 0
              }
            ]
          }
        ]
      }
    ],
    "exactFingerprints": [
      0
    ],
    "partialMatches": [
      {
        "id": 0,
        "file": {
          "id": 0,
          "gameId": 0,
          "modId": 0,
          "isAvailable": true,
          "displayName": "string",
          "fileName": "string",
          "releaseType": 1,
          "fileStatus": 1,
          "hashes": [
            {
              "value": "string",
              "algo": 1
            }
          ],
          "fileDate": "2019-08-24T14:15:22Z",
          "fileLength": 0,
          "downloadCount": 0,
          "fileSizeOnDisk": 0,
          "downloadUrl": "string",
          "gameVersions": [
            "string"
          ],
          "sortableGameVersions": [
            {
              "gameVersionName": "string",
              "gameVersionPadded": "string",
              "gameVersion": "string",
              "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
              "gameVersionTypeId": 0
            }
          ],
          "dependencies": [
            {
              "modId": 0,
              "relationType": 1
            }
          ],
          "exposeAsAlternative": true,
          "parentProjectFileId": 0,
          "alternateFileId": 0,
          "isServerPack": true,
          "serverPackFileId": 0,
          "isEarlyAccessContent": true,
          "earlyAccessEndDate": "2019-08-24T14:15:22Z",
          "fileFingerprint": 0,
          "modules": [
            {
              "name": "string",
              "fingerprint": 0
            }
          ]
        },
        "latestFiles": [
          {
            "id": 0,
            "gameId": 0,
            "modId": 0,
            "isAvailable": true,
            "displayName": "string",
            "fileName": "string",
            "releaseType": 1,
            "fileStatus": 1,
            "hashes": [
              {
                "value": "string",
                "algo": 1
              }
            ],
            "fileDate": "2019-08-24T14:15:22Z",
            "fileLength": 0,
            "downloadCount": 0,
            "fileSizeOnDisk": 0,
            "downloadUrl": "string",
            "gameVersions": [
              "string"
            ],
            "sortableGameVersions": [
              {
                "gameVersionName": "string",
                "gameVersionPadded": "string",
                "gameVersion": "string",
                "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
                "gameVersionTypeId": 0
              }
            ],
            "dependencies": [
              {
                "modId": 0,
                "relationType": 1
              }
            ],
            "exposeAsAlternative": true,
            "parentProjectFileId": 0,
            "alternateFileId": 0,
            "isServerPack": true,
            "serverPackFileId": 0,
            "isEarlyAccessContent": true,
            "earlyAccessEndDate": "2019-08-24T14:15:22Z",
            "fileFingerprint": 0,
            "modules": [
              {
                "name": "string",
                "fingerprint": 0
              }
            ]
          }
        ]
      }
    ],
    "partialMatchFingerprints": {
      "property1": [
        0
      ],
      "property2": [
        0
      ]
    },
    "installedFingerprints": [
      0
    ],
    "unmatchedFingerprints": [
      0
    ]
  }
}

Properties
Name	Type	Description
data	FingerprintsMatchesResult	The response data
Get Fingerprints Fuzzy Matches Response

{
  "data": {
    "fuzzyMatches": [
      {
        "id": 0,
        "file": {
          "id": 0,
          "gameId": 0,
          "modId": 0,
          "isAvailable": true,
          "displayName": "string",
          "fileName": "string",
          "releaseType": 1,
          "fileStatus": 1,
          "hashes": [
            {
              "value": "string",
              "algo": 1
            }
          ],
          "fileDate": "2019-08-24T14:15:22Z",
          "fileLength": 0,
          "downloadCount": 0,
          "fileSizeOnDisk": 0,
          "downloadUrl": "string",
          "gameVersions": [
            "string"
          ],
          "sortableGameVersions": [
            {
              "gameVersionName": "string",
              "gameVersionPadded": "string",
              "gameVersion": "string",
              "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
              "gameVersionTypeId": 0
            }
          ],
          "dependencies": [
            {
              "modId": 0,
              "relationType": 1
            }
          ],
          "exposeAsAlternative": true,
          "parentProjectFileId": 0,
          "alternateFileId": 0,
          "isServerPack": true,
          "serverPackFileId": 0,
          "isEarlyAccessContent": true,
          "earlyAccessEndDate": "2019-08-24T14:15:22Z",
          "fileFingerprint": 0,
          "modules": [
            {
              "name": "string",
              "fingerprint": 0
            }
          ]
        },
        "latestFiles": [
          {
            "id": 0,
            "gameId": 0,
            "modId": 0,
            "isAvailable": true,
            "displayName": "string",
            "fileName": "string",
            "releaseType": 1,
            "fileStatus": 1,
            "hashes": [
              {
                "value": "string",
                "algo": 1
              }
            ],
            "fileDate": "2019-08-24T14:15:22Z",
            "fileLength": 0,
            "downloadCount": 0,
            "fileSizeOnDisk": 0,
            "downloadUrl": "string",
            "gameVersions": [
              "string"
            ],
            "sortableGameVersions": [
              {
                "gameVersionName": "string",
                "gameVersionPadded": "string",
                "gameVersion": "string",
                "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
                "gameVersionTypeId": 0
              }
            ],
            "dependencies": [
              {
                "modId": 0,
                "relationType": 1
              }
            ],
            "exposeAsAlternative": true,
            "parentProjectFileId": 0,
            "alternateFileId": 0,
            "isServerPack": true,
            "serverPackFileId": 0,
            "isEarlyAccessContent": true,
            "earlyAccessEndDate": "2019-08-24T14:15:22Z",
            "fileFingerprint": 0,
            "modules": [
              {
                "name": "string",
                "fingerprint": 0
              }
            ]
          }
        ],
        "fingerprints": [
          0
        ]
      }
    ]
  }
}

Properties
Name	Type	Description
data	FingerprintFuzzyMatchResult	The response data
Get Game Response

{
  "data": {
    "id": 0,
    "name": "string",
    "slug": "string",
    "dateModified": "2019-08-24T14:15:22Z",
    "assets": {
      "iconUrl": "string",
      "tileUrl": "string",
      "coverUrl": "string"
    },
    "status": 1,
    "apiStatus": 1
  }
}

Properties
Name	Type	Description
data	Game	The response data
Get Games Response

{
  "data": [
    {
      "id": 0,
      "name": "string",
      "slug": "string",
      "dateModified": "2019-08-24T14:15:22Z",
      "assets": {
        "iconUrl": "string",
        "tileUrl": "string",
        "coverUrl": "string"
      },
      "status": 1,
      "apiStatus": 1
    }
  ],
  "pagination": {
    "index": 0,
    "pageSize": 0,
    "resultCount": 0,
    "totalCount": 0
  }
}

Properties
Name	Type	Description
data	[Game]	The response data
pagination	Pagination	The response pagination information
Get Mod File Response

{
  "data": {
    "id": 0,
    "gameId": 0,
    "modId": 0,
    "isAvailable": true,
    "displayName": "string",
    "fileName": "string",
    "releaseType": 1,
    "fileStatus": 1,
    "hashes": [
      {
        "value": "string",
        "algo": 1
      }
    ],
    "fileDate": "2019-08-24T14:15:22Z",
    "fileLength": 0,
    "downloadCount": 0,
    "fileSizeOnDisk": 0,
    "downloadUrl": "string",
    "gameVersions": [
      "string"
    ],
    "sortableGameVersions": [
      {
        "gameVersionName": "string",
        "gameVersionPadded": "string",
        "gameVersion": "string",
        "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
        "gameVersionTypeId": 0
      }
    ],
    "dependencies": [
      {
        "modId": 0,
        "relationType": 1
      }
    ],
    "exposeAsAlternative": true,
    "parentProjectFileId": 0,
    "alternateFileId": 0,
    "isServerPack": true,
    "serverPackFileId": 0,
    "isEarlyAccessContent": true,
    "earlyAccessEndDate": "2019-08-24T14:15:22Z",
    "fileFingerprint": 0,
    "modules": [
      {
        "name": "string",
        "fingerprint": 0
      }
    ]
  }
}

Properties
Name	Type	Description
data	File	The response data
Get Mod Files Response

{
  "data": [
    {
      "id": 0,
      "gameId": 0,
      "modId": 0,
      "isAvailable": true,
      "displayName": "string",
      "fileName": "string",
      "releaseType": 1,
      "fileStatus": 1,
      "hashes": [
        {
          "value": "string",
          "algo": 1
        }
      ],
      "fileDate": "2019-08-24T14:15:22Z",
      "fileLength": 0,
      "downloadCount": 0,
      "fileSizeOnDisk": 0,
      "downloadUrl": "string",
      "gameVersions": [
        "string"
      ],
      "sortableGameVersions": [
        {
          "gameVersionName": "string",
          "gameVersionPadded": "string",
          "gameVersion": "string",
          "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
          "gameVersionTypeId": 0
        }
      ],
      "dependencies": [
        {
          "modId": 0,
          "relationType": 1
        }
      ],
      "exposeAsAlternative": true,
      "parentProjectFileId": 0,
      "alternateFileId": 0,
      "isServerPack": true,
      "serverPackFileId": 0,
      "isEarlyAccessContent": true,
      "earlyAccessEndDate": "2019-08-24T14:15:22Z",
      "fileFingerprint": 0,
      "modules": [
        {
          "name": "string",
          "fingerprint": 0
        }
      ]
    }
  ],
  "pagination": {
    "index": 0,
    "pageSize": 0,
    "resultCount": 0,
    "totalCount": 0
  }
}

Properties
Name	Type	Description
data	[File]	The response data
pagination	Pagination	The response pagination information
Get Mod Response

{
  "data": {
    "id": 0,
    "gameId": 0,
    "name": "string",
    "slug": "string",
    "links": {
      "websiteUrl": "string",
      "wikiUrl": "string",
      "issuesUrl": "string",
      "sourceUrl": "string"
    },
    "summary": "string",
    "status": 1,
    "downloadCount": 0,
    "isFeatured": true,
    "primaryCategoryId": 0,
    "categories": [
      {
        "id": 0,
        "gameId": 0,
        "name": "string",
        "slug": "string",
        "url": "string",
        "iconUrl": "string",
        "dateModified": "2019-08-24T14:15:22Z",
        "isClass": true,
        "classId": 0,
        "parentCategoryId": 0,
        "displayIndex": 0
      }
    ],
    "classId": 0,
    "authors": [
      {
        "id": 0,
        "name": "string",
        "url": "string"
      }
    ],
    "logo": {
      "id": 0,
      "modId": 0,
      "title": "string",
      "description": "string",
      "thumbnailUrl": "string",
      "url": "string"
    },
    "screenshots": [
      {
        "id": 0,
        "modId": 0,
        "title": "string",
        "description": "string",
        "thumbnailUrl": "string",
        "url": "string"
      }
    ],
    "mainFileId": 0,
    "latestFiles": [
      {
        "id": 0,
        "gameId": 0,
        "modId": 0,
        "isAvailable": true,
        "displayName": "string",
        "fileName": "string",
        "releaseType": 1,
        "fileStatus": 1,
        "hashes": [
          {
            "value": "string",
            "algo": 1
          }
        ],
        "fileDate": "2019-08-24T14:15:22Z",
        "fileLength": 0,
        "downloadCount": 0,
        "fileSizeOnDisk": 0,
        "downloadUrl": "string",
        "gameVersions": [
          "string"
        ],
        "sortableGameVersions": [
          {
            "gameVersionName": "string",
            "gameVersionPadded": "string",
            "gameVersion": "string",
            "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
            "gameVersionTypeId": 0
          }
        ],
        "dependencies": [
          {
            "modId": 0,
            "relationType": 1
          }
        ],
        "exposeAsAlternative": true,
        "parentProjectFileId": 0,
        "alternateFileId": 0,
        "isServerPack": true,
        "serverPackFileId": 0,
        "isEarlyAccessContent": true,
        "earlyAccessEndDate": "2019-08-24T14:15:22Z",
        "fileFingerprint": 0,
        "modules": [
          {
            "name": "string",
            "fingerprint": 0
          }
        ]
      }
    ],
    "latestFilesIndexes": [
      {
        "gameVersion": "string",
        "fileId": 0,
        "filename": "string",
        "releaseType": 1,
        "gameVersionTypeId": 0,
        "modLoader": 0
      }
    ],
    "latestEarlyAccessFilesIndexes": [
      {
        "gameVersion": "string",
        "fileId": 0,
        "filename": "string",
        "releaseType": 1,
        "gameVersionTypeId": 0,
        "modLoader": 0
      }
    ],
    "dateCreated": "2019-08-24T14:15:22Z",
    "dateModified": "2019-08-24T14:15:22Z",
    "dateReleased": "2019-08-24T14:15:22Z",
    "allowModDistribution": true,
    "gamePopularityRank": 0,
    "isAvailable": true,
    "thumbsUpCount": 0,
    "rating": 0
  }
}

Properties
Name	Type	Description
data	Mod	The response data
Get Mods Response

{
  "data": [
    {
      "id": 0,
      "gameId": 0,
      "name": "string",
      "slug": "string",
      "links": {
        "websiteUrl": "string",
        "wikiUrl": "string",
        "issuesUrl": "string",
        "sourceUrl": "string"
      },
      "summary": "string",
      "status": 1,
      "downloadCount": 0,
      "isFeatured": true,
      "primaryCategoryId": 0,
      "categories": [
        {
          "id": 0,
          "gameId": 0,
          "name": "string",
          "slug": "string",
          "url": "string",
          "iconUrl": "string",
          "dateModified": "2019-08-24T14:15:22Z",
          "isClass": true,
          "classId": 0,
          "parentCategoryId": 0,
          "displayIndex": 0
        }
      ],
      "classId": 0,
      "authors": [
        {
          "id": 0,
          "name": "string",
          "url": "string"
        }
      ],
      "logo": {
        "id": 0,
        "modId": 0,
        "title": "string",
        "description": "string",
        "thumbnailUrl": "string",
        "url": "string"
      },
      "screenshots": [
        {
          "id": 0,
          "modId": 0,
          "title": "string",
          "description": "string",
          "thumbnailUrl": "string",
          "url": "string"
        }
      ],
      "mainFileId": 0,
      "latestFiles": [
        {
          "id": 0,
          "gameId": 0,
          "modId": 0,
          "isAvailable": true,
          "displayName": "string",
          "fileName": "string",
          "releaseType": 1,
          "fileStatus": 1,
          "hashes": [
            {
              "value": "string",
              "algo": 1
            }
          ],
          "fileDate": "2019-08-24T14:15:22Z",
          "fileLength": 0,
          "downloadCount": 0,
          "fileSizeOnDisk": 0,
          "downloadUrl": "string",
          "gameVersions": [
            "string"
          ],
          "sortableGameVersions": [
            {
              "gameVersionName": "string",
              "gameVersionPadded": "string",
              "gameVersion": "string",
              "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
              "gameVersionTypeId": 0
            }
          ],
          "dependencies": [
            {
              "modId": 0,
              "relationType": 1
            }
          ],
          "exposeAsAlternative": true,
          "parentProjectFileId": 0,
          "alternateFileId": 0,
          "isServerPack": true,
          "serverPackFileId": 0,
          "isEarlyAccessContent": true,
          "earlyAccessEndDate": "2019-08-24T14:15:22Z",
          "fileFingerprint": 0,
          "modules": [
            {
              "name": "string",
              "fingerprint": 0
            }
          ]
        }
      ],
      "latestFilesIndexes": [
        {
          "gameVersion": "string",
          "fileId": 0,
          "filename": "string",
          "releaseType": 1,
          "gameVersionTypeId": 0,
          "modLoader": 0
        }
      ],
      "latestEarlyAccessFilesIndexes": [
        {
          "gameVersion": "string",
          "fileId": 0,
          "filename": "string",
          "releaseType": 1,
          "gameVersionTypeId": 0,
          "modLoader": 0
        }
      ],
      "dateCreated": "2019-08-24T14:15:22Z",
      "dateModified": "2019-08-24T14:15:22Z",
      "dateReleased": "2019-08-24T14:15:22Z",
      "allowModDistribution": true,
      "gamePopularityRank": 0,
      "isAvailable": true,
      "thumbsUpCount": 0,
      "rating": 0
    }
  ]
}

Properties
Name	Type	Description
data	[Mod]	The response data
Get Version Types Response

{
  "data": [
    {
      "id": 0,
      "gameId": 0,
      "name": "string",
      "slug": "string",
      "isSyncable": true,
      "status": 1
    }
  ]
}

Properties
Name	Type	Description
data	[GameVersionType]	The response data
Get Versions Response - V1

{
  "data": [
    {
      "type": 0,
      "versions": [
        "string"
      ]
    }
  ]
}

Properties
Name	Type	Description
data	[GameVersionsByType]	The response data
Get Versions Response - V2

{
  "data": [
    {
      "type": 0,
      "versions": [
        {
          "id": 0,
          "slug": "string",
          "name": "string"
        }
      ]
    }
  ]
}

Properties
Name	Type	Description
data	[GameVersionsByType2]	The response data
GetFeaturedModsRequestBody

{
  "gameId": 0,
  "excludedModIds": [
    0
  ],
  "gameVersionTypeId": 0
}

Properties
Name	Type	Description
gameId	integer(int32)	none
excludedModIds	[integer]	none
gameVersionTypeId	integer(int32)¦null	none
GetFingerprintMatchesRequestBody

{
  "fingerprints": [
    0
  ]
}

Properties
Name	Type	Description
fingerprints	[integer]	none
GetFuzzyMatchesRequestBody

{
  "gameId": 0,
  "fingerprints": [
    {
      "foldername": "string",
      "fingerprints": [
        0
      ]
    }
  ]
}

Properties
Name	Type	Description
gameId	integer(int32)	none
fingerprints	[FolderFingerprint]	none
GetModFilesRequestBody

{
  "fileIds": [
    0
  ]
}

Properties
Name	Type	Description
fileIds	[integer]	none
GetModsByIdsListRequestBody

{
  "modIds": [
    0
  ],
  "filterPcOnly": true
}

Properties
Name	Type	Description
modIds	[integer]	none
filterPcOnly	boolean¦null	none
HashAlgo

1

Possible enum values:

1=Sha1

2=Md5

MinecraftGameVersion

{
  "id": 0,
  "gameVersionId": 0,
  "versionString": "string",
  "jarDownloadUrl": "string",
  "jsonDownloadUrl": "string",
  "approved": true,
  "dateModified": "2019-08-24T14:15:22Z",
  "gameVersionTypeId": 0,
  "gameVersionStatus": 1,
  "gameVersionTypeStatus": 1
}

Properties
Name	Type	Description
id	integer(int32)	none
gameVersionId	integer(int32)	none
versionString	string	none
jarDownloadUrl	string	none
jsonDownloadUrl	string	none
approved	boolean	none
dateModified	string(date-time)	none
gameVersionTypeId	integer(int32)	none
gameVersionStatus	GameVersionStatus	1 = Approved
2 = Deleted
3 = New
gameVersionTypeStatus	GameVersionTypeStatus	1 = Normal
2 = Deleted
MinecraftModLoaderIndex

{
  "name": "string",
  "gameVersion": "string",
  "latest": true,
  "recommended": true,
  "dateModified": "2019-08-24T14:15:22Z",
  "type": 0
}

Properties
Name	Type	Description
name	string	none
gameVersion	string	none
latest	boolean	none
recommended	boolean	none
dateModified	string(date-time)	none
type	ModLoaderType	0 = Any
1 = Forge
2 = Cauldron
3 = LiteLoader
4 = Fabric
5 = Quilt
6 = NeoForge
MinecraftModLoaderVersion

{
  "id": 0,
  "gameVersionId": 0,
  "minecraftGameVersionId": 0,
  "forgeVersion": "string",
  "name": "string",
  "type": 0,
  "downloadUrl": "string",
  "filename": "string",
  "installMethod": 1,
  "latest": true,
  "recommended": true,
  "approved": true,
  "dateModified": "2019-08-24T14:15:22Z",
  "mavenVersionString": "string",
  "versionJson": "string",
  "librariesInstallLocation": "string",
  "minecraftVersion": "string",
  "additionalFilesJson": "string",
  "modLoaderGameVersionId": 0,
  "modLoaderGameVersionTypeId": 0,
  "modLoaderGameVersionStatus": 1,
  "modLoaderGameVersionTypeStatus": 1,
  "mcGameVersionId": 0,
  "mcGameVersionTypeId": 0,
  "mcGameVersionStatus": 1,
  "mcGameVersionTypeStatus": 1,
  "installProfileJson": "string"
}

Properties
Name	Type	Description
id	integer(int32)	none
gameVersionId	integer(int32)	none
minecraftGameVersionId	integer(int32)	none
forgeVersion	string	none
name	string	none
type	ModLoaderType	0 = Any
1 = Forge
2 = Cauldron
3 = LiteLoader
4 = Fabric
5 = Quilt
6 = NeoForge
downloadUrl	string	none
filename	string	none
installMethod	ModLoaderInstallMethod	1 = ForgeInstaller
2 = ForgeJarInstall
3 = ForgeInstaller_v2
4 = FabricInstaller
5 = QuiltInstaller
6 = NeoForgeInstaller
latest	boolean	none
recommended	boolean	none
approved	boolean	none
dateModified	string(date-time)	none
mavenVersionString	string	none
versionJson	string	none
librariesInstallLocation	string	none
minecraftVersion	string	none
additionalFilesJson	string	none
modLoaderGameVersionId	integer(int32)	none
modLoaderGameVersionTypeId	integer(int32)	none
modLoaderGameVersionStatus	GameVersionStatus	1 = Approved
2 = Deleted
3 = New
modLoaderGameVersionTypeStatus	GameVersionTypeStatus	1 = Normal
2 = Deleted
mcGameVersionId	integer(int32)	none
mcGameVersionTypeId	integer(int32)	none
mcGameVersionStatus	GameVersionStatus	1 = Approved
2 = Deleted
3 = New
mcGameVersionTypeStatus	GameVersionTypeStatus	1 = Normal
2 = Deleted
installProfileJson	string	none
Mod

{
  "id": 0,
  "gameId": 0,
  "name": "string",
  "slug": "string",
  "links": {
    "websiteUrl": "string",
    "wikiUrl": "string",
    "issuesUrl": "string",
    "sourceUrl": "string"
  },
  "summary": "string",
  "status": 1,
  "downloadCount": 0,
  "isFeatured": true,
  "primaryCategoryId": 0,
  "categories": [
    {
      "id": 0,
      "gameId": 0,
      "name": "string",
      "slug": "string",
      "url": "string",
      "iconUrl": "string",
      "dateModified": "2019-08-24T14:15:22Z",
      "isClass": true,
      "classId": 0,
      "parentCategoryId": 0,
      "displayIndex": 0
    }
  ],
  "classId": 0,
  "authors": [
    {
      "id": 0,
      "name": "string",
      "url": "string"
    }
  ],
  "logo": {
    "id": 0,
    "modId": 0,
    "title": "string",
    "description": "string",
    "thumbnailUrl": "string",
    "url": "string"
  },
  "screenshots": [
    {
      "id": 0,
      "modId": 0,
      "title": "string",
      "description": "string",
      "thumbnailUrl": "string",
      "url": "string"
    }
  ],
  "mainFileId": 0,
  "latestFiles": [
    {
      "id": 0,
      "gameId": 0,
      "modId": 0,
      "isAvailable": true,
      "displayName": "string",
      "fileName": "string",
      "releaseType": 1,
      "fileStatus": 1,
      "hashes": [
        {
          "value": "string",
          "algo": 1
        }
      ],
      "fileDate": "2019-08-24T14:15:22Z",
      "fileLength": 0,
      "downloadCount": 0,
      "fileSizeOnDisk": 0,
      "downloadUrl": "string",
      "gameVersions": [
        "string"
      ],
      "sortableGameVersions": [
        {
          "gameVersionName": "string",
          "gameVersionPadded": "string",
          "gameVersion": "string",
          "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
          "gameVersionTypeId": 0
        }
      ],
      "dependencies": [
        {
          "modId": 0,
          "relationType": 1
        }
      ],
      "exposeAsAlternative": true,
      "parentProjectFileId": 0,
      "alternateFileId": 0,
      "isServerPack": true,
      "serverPackFileId": 0,
      "isEarlyAccessContent": true,
      "earlyAccessEndDate": "2019-08-24T14:15:22Z",
      "fileFingerprint": 0,
      "modules": [
        {
          "name": "string",
          "fingerprint": 0
        }
      ]
    }
  ],
  "latestFilesIndexes": [
    {
      "gameVersion": "string",
      "fileId": 0,
      "filename": "string",
      "releaseType": 1,
      "gameVersionTypeId": 0,
      "modLoader": 0
    }
  ],
  "latestEarlyAccessFilesIndexes": [
    {
      "gameVersion": "string",
      "fileId": 0,
      "filename": "string",
      "releaseType": 1,
      "gameVersionTypeId": 0,
      "modLoader": 0
    }
  ],
  "dateCreated": "2019-08-24T14:15:22Z",
  "dateModified": "2019-08-24T14:15:22Z",
  "dateReleased": "2019-08-24T14:15:22Z",
  "allowModDistribution": true,
  "gamePopularityRank": 0,
  "isAvailable": true,
  "thumbsUpCount": 0,
  "rating": 0
}

Properties
Name	Type	Description
id	integer(int32)	The mod id
gameId	integer(int32)	The game id this mod is for
name	string	The name of the mod
slug	string	The mod slug that would appear in the URL
links	ModLinks	Relevant links for the mod such as Issue tracker and Wiki
summary	string	Mod summary
status	ModStatus	Current mod status
downloadCount	integer(int64)	Number of downloads for the mod
isFeatured	boolean	Whether the mod is included in the featured mods list
primaryCategoryId	integer(int32)	The main category of the mod as it was chosen by the mod author
categories	[Category]	List of categories that this mod is related to
classId	integer(int32)¦null	The class id this mod belongs to
authors	[ModAuthor]	List of the mod's authors
logo	ModAsset	The mod's logo asset
screenshots	[ModAsset]	List of screenshots assets
mainFileId	integer(int32)	The id of the main file of the mod
latestFiles	[File]	List of latest files of the mod
latestFilesIndexes	[FileIndex]	List of file related details for the latest files of the mod
latestEarlyAccessFilesIndexes	[FileIndex]	List of file related details for the latest early access files of the mod
dateCreated	string(date-time)	The creation date of the mod
dateModified	string(date-time)	The last time the mod was modified
dateReleased	string(date-time)	The release date of the mod
allowModDistribution	boolean¦null	Is mod allowed to be distributed
gamePopularityRank	integer(int32)	The mod popularity rank for the game
isAvailable	boolean	Is the mod available for search. This can be false when a mod is experimental, in a deleted state or has only alpha files
thumbsUpCount	integer(int32)	The mod's thumbs up count
rating	number(decimal)¦null	The mod's Rating
ModAsset

{
  "id": 0,
  "modId": 0,
  "title": "string",
  "description": "string",
  "thumbnailUrl": "string",
  "url": "string"
}

Properties
Name	Type	Description
id	integer(int32)	none
modId	integer(int32)	none
title	string	none
description	string	none
thumbnailUrl	string	none
url	string	none
ModAuthor

{
  "id": 0,
  "name": "string",
  "url": "string"
}

Properties
Name	Type	Description
id	integer(int32)	none
name	string	none
url	string	none
ModLinks

{
  "websiteUrl": "string",
  "wikiUrl": "string",
  "issuesUrl": "string",
  "sourceUrl": "string"
}

Properties
Name	Type	Description
websiteUrl	string	none
wikiUrl	string	none
issuesUrl	string	none
sourceUrl	string	none
ModLoaderInstallMethod

1

Possible enum values:

1=ForgeInstaller

2=ForgeJarInstall

3=ForgeInstaller_v2

4=FabricInstaller

5=QuiltInstaller

6=NeoForgeInstaller

ModLoaderType

0

Possible enum values:

0=Any

1=Forge

2=Cauldron

3=LiteLoader

4=Fabric

5=Quilt

6=NeoForge

ModsSearchSortField

1

Possible enum values:

1=Featured

2=Popularity

3=LastUpdated

4=Name

5=Author

6=TotalDownloads

7=Category

8=GameVersion

9=EarlyAccess

10=FeaturedReleased

11=ReleasedDate

12=Rating

ModStatus

1

Possible enum values:

1=New

2=ChangesRequired

3=UnderSoftReview

4=Approved

5=Rejected

6=ChangesMade

7=Inactive

8=Abandoned

9=Deleted

10=UnderReview

Pagination

{
  "index": 0,
  "pageSize": 0,
  "resultCount": 0,
  "totalCount": 0
}

Properties
Name	Type	Description
index	integer(int32)	A zero based index of the first item that is included in the response
pageSize	integer(int32)	The requested number of items to be included in the response
resultCount	integer(int32)	The actual number of items that were included in the response
totalCount	integer(int64)	The total number of items available by the request
Search Mods Response

{
  "data": [
    {
      "id": 0,
      "gameId": 0,
      "name": "string",
      "slug": "string",
      "links": {
        "websiteUrl": "string",
        "wikiUrl": "string",
        "issuesUrl": "string",
        "sourceUrl": "string"
      },
      "summary": "string",
      "status": 1,
      "downloadCount": 0,
      "isFeatured": true,
      "primaryCategoryId": 0,
      "categories": [
        {
          "id": 0,
          "gameId": 0,
          "name": "string",
          "slug": "string",
          "url": "string",
          "iconUrl": "string",
          "dateModified": "2019-08-24T14:15:22Z",
          "isClass": true,
          "classId": 0,
          "parentCategoryId": 0,
          "displayIndex": 0
        }
      ],
      "classId": 0,
      "authors": [
        {
          "id": 0,
          "name": "string",
          "url": "string"
        }
      ],
      "logo": {
        "id": 0,
        "modId": 0,
        "title": "string",
        "description": "string",
        "thumbnailUrl": "string",
        "url": "string"
      },
      "screenshots": [
        {
          "id": 0,
          "modId": 0,
          "title": "string",
          "description": "string",
          "thumbnailUrl": "string",
          "url": "string"
        }
      ],
      "mainFileId": 0,
      "latestFiles": [
        {
          "id": 0,
          "gameId": 0,
          "modId": 0,
          "isAvailable": true,
          "displayName": "string",
          "fileName": "string",
          "releaseType": 1,
          "fileStatus": 1,
          "hashes": [
            {
              "value": "string",
              "algo": 1
            }
          ],
          "fileDate": "2019-08-24T14:15:22Z",
          "fileLength": 0,
          "downloadCount": 0,
          "fileSizeOnDisk": 0,
          "downloadUrl": "string",
          "gameVersions": [
            "string"
          ],
          "sortableGameVersions": [
            {
              "gameVersionName": "string",
              "gameVersionPadded": "string",
              "gameVersion": "string",
              "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
              "gameVersionTypeId": 0
            }
          ],
          "dependencies": [
            {
              "modId": 0,
              "relationType": 1
            }
          ],
          "exposeAsAlternative": true,
          "parentProjectFileId": 0,
          "alternateFileId": 0,
          "isServerPack": true,
          "serverPackFileId": 0,
          "isEarlyAccessContent": true,
          "earlyAccessEndDate": "2019-08-24T14:15:22Z",
          "fileFingerprint": 0,
          "modules": [
            {
              "name": "string",
              "fingerprint": 0
            }
          ]
        }
      ],
      "latestFilesIndexes": [
        {
          "gameVersion": "string",
          "fileId": 0,
          "filename": "string",
          "releaseType": 1,
          "gameVersionTypeId": 0,
          "modLoader": 0
        }
      ],
      "latestEarlyAccessFilesIndexes": [
        {
          "gameVersion": "string",
          "fileId": 0,
          "filename": "string",
          "releaseType": 1,
          "gameVersionTypeId": 0,
          "modLoader": 0
        }
      ],
      "dateCreated": "2019-08-24T14:15:22Z",
      "dateModified": "2019-08-24T14:15:22Z",
      "dateReleased": "2019-08-24T14:15:22Z",
      "allowModDistribution": true,
      "gamePopularityRank": 0,
      "isAvailable": true,
      "thumbsUpCount": 0,
      "rating": 0
    }
  ],
  "pagination": {
    "index": 0,
    "pageSize": 0,
    "resultCount": 0,
    "totalCount": 0
  }
}

Properties
Name	Type	Description
data	[Mod]	The response data
pagination	Pagination	The response pagination information
SortableGameVersion

{
  "gameVersionName": "string",
  "gameVersionPadded": "string",
  "gameVersion": "string",
  "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
  "gameVersionTypeId": 0
}

Properties
Name	Type	Description
gameVersionName	string	Original version name (e.g. 1.5b)
gameVersionPadded	string	Used for sorting (e.g. 0000000001.0000000005)
gameVersion	string	game version clean name (e.g. 1.5)
gameVersionReleaseDate	string(date-time)	Game version release date
gameVersionTypeId	integer(int32)¦null	Game version type id
SortOrder

"asc"

String Response

{
  "data": "string"
}

html
GET /v1/games HTTP/1.1

Accept: application/json

GET /v1/games

Get all games that are available to the provided API key.

Parameters
Name	In	Type	Required	Description
index	query	integer(int32)	false	A zero based index of the first item to include in the response, the limit is: (index + pageSize <= 10,000).
pageSize	query	integer(int32)	false	The number of items to include in the response, the default/maximum value is 50.
Example responses

200 Response

{
  "data": [
    {
      "id": 0,
      "name": "string",
      "slug": "string",
      "dateModified": "2019-08-24T14:15:22Z",
      "assets": {
        "iconUrl": "string",
        "tileUrl": "string",
        "coverUrl": "string"
      },
      "status": 1,
      "apiStatus": 1
    }
  ],
  "pagination": {
    "index": 0,
    "pageSize": 0,
    "resultCount": 0,
    "totalCount": 0
  }
}
Responses
Status	Meaning	Description	Schema
200	OK	none	Get Games Response
500	Internal Server Error	none	None
To perform this operation, you must be authenticated by means of one of the following methods: API_KEY
Get Game

Code samples

GET /v1/games/{gameId} HTTP/1.1

Accept: application/json

GET /v1/games/{gameId}

Get a single game. A private game is only accessible by its respective API key.

Parameters
Name	In	Type	Required	Description
gameId	path	integer(int32)	true	A game unique id
Example responses

200 Response

{
  "data": {
    "id": 0,
    "name": "string",
    "slug": "string",
    "dateModified": "2019-08-24T14:15:22Z",
    "assets": {
      "iconUrl": "string",
      "tileUrl": "string",
      "coverUrl": "string"
    },
    "status": 1,
    "apiStatus": 1
  }
}
Responses
Status	Meaning	Description	Schema
200	OK	none	Get Game Response
404	Not Found	none	None
500	Internal Server Error	none	None
To perform this operation, you must be authenticated by means of one of the following methods: API_KEY
Get Versions

Code samples

GET /v1/games/{gameId}/versions HTTP/1.1

Accept: application/json

GET /v1/games/{gameId}/versions

Get all available versions for each known version type of the specified game. A private game is only accessible to its respective API key.

Parameters
Name	In	Type	Required	Description
gameId	path	integer(int32)	true	A game unique id
Example responses

200 Response

{
  "data": [
    {
      "type": 0,
      "versions": [
        "string"
      ]
    }
  ]
}
Responses
Status	Meaning	Description	Schema
200	OK	none	Get Versions Response - V1
404	Not Found	none	None
500	Internal Server Error	none	None
To perform this operation, you must be authenticated by means of one of the following methods: API_KEY
Get Version Types

Code samples

GET /v1/games/{gameId}/version-types HTTP/1.1

Accept: application/json

GET /v1/games/{gameId}/version-types

Get all available version types of the specified game.

A private game is only accessible to its respective API key.

Currently, when creating games via the CurseForge for Studios Console, you are limited to a single game version type. This means that this endpoint is probably not useful in most cases and is relevant mostly when handling existing games that have multiple game versions such as World of Warcraft and Minecraft (e.g. 517 for wow_retail).

Parameters
Name	In	Type	Required	Description
gameId	path	integer(int32)	true	A game unique id
Example responses

200 Response

{
  "data": [
    {
      "id": 0,
      "gameId": 0,
      "name": "string",
      "slug": "string",
      "isSyncable": true,
      "status": 1
    }
  ]
}
Responses
Status	Meaning	Description	Schema
200	OK	none	Get Version Types Response
404	Not Found	none	None
500	Internal Server Error	none	None
To perform this operation, you must be authenticated by means of one of the following methods: API_KEY
Get Versions - V2

Code samples

GET /v2/games/{gameId}/versions HTTP/1.1

Accept: application/json

GET /v2/games/{gameId}/versions

Get all available versions for each known version type of the specified game. A private game is only accessible to its respective API key.

Parameters
Name	In	Type	Required	Description
gameId	path	integer(int32)	true	A game unique id
Example responses

200 Response

{
  "data": [
    {
      "type": 0,
      "versions": [
        {
          "id": 0,
          "slug": "string",
          "name": "string"
        }
      ]
    }
  ]
}
Responses
Status	Meaning	Description	Schema
200	OK	none	Get Versions Response - V2
404	Not Found	none	None
500	Internal Server Error	none	None
To perform this operation, you must be authenticated by means of one of the following methods: API_KEY
Categories
Get Categories

Code samples

GET /v1/categories?gameId=0 HTTP/1.1

Accept: application/json

GET /v1/categories

Get all available classes and categories of the specified game. Specify a game id for a list of all game categories, or a class id for a list of categories under that class. specifiy the classes Only flag to just get the classes for a given game.

Parameters
Name	In	Type	Required	Description
gameId	query	integer(int32)	true	A game unique id
classId	query	integer(int32)	false	A class unique id
classesOnly	query	boolean	false	A flag used with gameId to return only classes
Example responses

200 Response

{
  "data": [
    {
      "id": 0,
      "gameId": 0,
      "name": "string",
      "slug": "string",
      "url": "string",
      "iconUrl": "string",
      "dateModified": "2019-08-24T14:15:22Z",
      "isClass": true,
      "classId": 0,
      "parentCategoryId": 0,
      "displayIndex": 0
    }
  ]
}
Responses
Status	Meaning	Description	Schema
200	OK	none	Get Categories Response
404	Not Found	none	None
500	Internal Server Error	none	None
To perform this operation, you must be authenticated by means of one of the following methods: API_KEY
Mods
Search Mods

Code samples

GET /v1/mods/search?gameId=0 HTTP/1.1

Accept: application/json

GET /v1/mods/search

Get all mods that match the search criteria.

Parameters
Name	In	Type	Required	Description
gameId	query	integer(int32)	true	Filter by game id.
classId	query	integer(int32)	false	Filter by section id (discoverable via Categories)
categoryId	query	integer(int32)	false	Filter by category id
categoryIds	query	string	false	Filter by a list of category ids - this will override categoryId
gameVersion	query	string	false	Filter by game version string
gameVersions	query	string	false	Filter by a list of game version strings - this will override
searchFilter	query	string	false	Filter by free text search in the mod name and author
sortField	query	ModsSearchSortField	false	Filter by ModsSearchSortField enumeration
sortOrder	query	SortOrder	false	'asc' if sort is in ascending order, 'desc' if sort is in descending order
modLoaderType	query	ModLoaderType	false	Filter only mods associated to a given modloader (Forge, Fabric ...). Must be coupled with gameVersion.
modLoaderTypes	query	string	false	Filter by a list of mod loader types - this will override modLoaderType
gameVersionTypeId	query	integer(int32)	false	Filter only mods that contain files tagged with versions of the given gameVersionTypeId
authorId	query	integer(int32)	false	Filter only mods that the given authorId is a member of.
primaryAuthorId	query	integer(int32)	false	Filter only mods that the given primaryAuthorId is the owner of.
slug	query	string	false	Filter by slug (coupled with classId will result in a unique result).
index	query	integer(int32)	false	A zero based index of the first item to include in the response, the limit is: (index + pageSize <= 10,000).
pageSize	query	integer(int32)	false	The number of items to include in the response, the default/maximum value is 50.
Detailed descriptions
categoryIds: Filter by a list of category ids - this will override categoryId categoryIds=[1,2,3...]

The maximum allowed category ids per query is 10

gameVersions: Filter by a list of game version strings - this will override gameVersion

gameVersions=["1.19.1", "1.19.2", "1.20.1" ...]

The maximum allowed category ids per query is 4

modLoaderTypes: Filter by a list of mod loader types - this will override modLoaderType modLoaderTypes=[Forge, Fabric, ...]

Max values = 5

Enumerated Values
Parameter	Value
sortField	1
sortField	2
sortField	3
sortField	4
sortField	5
sortField	6
sortField	7
sortField	8
sortField	9
sortField	10
sortField	11
sortField	12
sortOrder	asc
sortOrder	desc
modLoaderType	0
modLoaderType	1
modLoaderType	2
modLoaderType	3
modLoaderType	4
modLoaderType	5
modLoaderType	6
Example responses

200 Response

{
  "data": [
    {
      "id": 0,
      "gameId": 0,
      "name": "string",
      "slug": "string",
      "links": {
        "websiteUrl": "string",
        "wikiUrl": "string",
        "issuesUrl": "string",
        "sourceUrl": "string"
      },
      "summary": "string",
      "status": 1,
      "downloadCount": 0,
      "isFeatured": true,
      "primaryCategoryId": 0,
      "categories": [
        {
          "id": 0,
          "gameId": 0,
          "name": "string",
          "slug": "string",
          "url": "string",
          "iconUrl": "string",
          "dateModified": "2019-08-24T14:15:22Z",
          "isClass": true,
          "classId": 0,
          "parentCategoryId": 0,
          "displayIndex": 0
        }
      ],
      "classId": 0,
      "authors": [
        {
          "id": 0,
          "name": "string",
          "url": "string"
        }
      ],
      "logo": {
        "id": 0,
        "modId": 0,
        "title": "string",
        "description": "string",
        "thumbnailUrl": "string",
        "url": "string"
      },
      "screenshots": [
        {
          "id": 0,
          "modId": 0,
          "title": "string",
          "description": "string",
          "thumbnailUrl": "string",
          "url": "string"
        }
      ],
      "mainFileId": 0,
      "latestFiles": [
        {
          "id": 0,
          "gameId": 0,
          "modId": 0,
          "isAvailable": true,
          "displayName": "string",
          "fileName": "string",
          "releaseType": 1,
          "fileStatus": 1,
          "hashes": [
            {
              "value": "string",
              "algo": 1
            }
          ],
          "fileDate": "2019-08-24T14:15:22Z",
          "fileLength": 0,
          "downloadCount": 0,
          "fileSizeOnDisk": 0,
          "downloadUrl": "string",
          "gameVersions": [
            "string"
          ],
          "sortableGameVersions": [
            {
              "gameVersionName": "string",
              "gameVersionPadded": "string",
              "gameVersion": "string",
              "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
              "gameVersionTypeId": 0
            }
          ],
          "dependencies": [
            {
              "modId": 0,
              "relationType": 1
            }
          ],
          "exposeAsAlternative": true,
          "parentProjectFileId": 0,
          "alternateFileId": 0,
          "isServerPack": true,
          "serverPackFileId": 0,
          "isEarlyAccessContent": true,
          "earlyAccessEndDate": "2019-08-24T14:15:22Z",
          "fileFingerprint": 0,
          "modules": [
            {
              "name": "string",
              "fingerprint": 0
            }
          ]
        }
      ],
      "latestFilesIndexes": [
        {
          "gameVersion": "string",
          "fileId": 0,
          "filename": "string",
          "releaseType": 1,
          "gameVersionTypeId": 0,
          "modLoader": 0
        }
      ],
      "latestEarlyAccessFilesIndexes": [
        {
          "gameVersion": "string",
          "fileId": 0,
          "filename": "string",
          "releaseType": 1,
          "gameVersionTypeId": 0,
          "modLoader": 0
        }
      ],
      "dateCreated": "2019-08-24T14:15:22Z",
      "dateModified": "2019-08-24T14:15:22Z",
      "dateReleased": "2019-08-24T14:15:22Z",
      "allowModDistribution": true,
      "gamePopularityRank": 0,
      "isAvailable": true,
      "thumbsUpCount": 0,
      "rating": 0
    }
  ],
  "pagination": {
    "index": 0,
    "pageSize": 0,
    "resultCount": 0,
    "totalCount": 0
  }
}
Responses
Status	Meaning	Description	Schema
200	OK	none	Search Mods Response
400	Bad Request	none	None
500	Internal Server Error	none	None
To perform this operation, you must be authenticated by means of one of the following methods: API_KEY
Get Mod

Code samples

GET /v1/mods/{modId} HTTP/1.1

Accept: application/json

GET /v1/mods/{modId}

Get a single mod.

Parameters
Name	In	Type	Required	Description
modId	path	integer(int32)	true	The mod id
Example responses

200 Response

{
  "data": {
    "id": 0,
    "gameId": 0,
    "name": "string",
    "slug": "string",
    "links": {
      "websiteUrl": "string",
      "wikiUrl": "string",
      "issuesUrl": "string",
      "sourceUrl": "string"
    },
    "summary": "string",
    "status": 1,
    "downloadCount": 0,
    "isFeatured": true,
    "primaryCategoryId": 0,
    "categories": [
      {
        "id": 0,
        "gameId": 0,
        "name": "string",
        "slug": "string",
        "url": "string",
        "iconUrl": "string",
        "dateModified": "2019-08-24T14:15:22Z",
        "isClass": true,
        "classId": 0,
        "parentCategoryId": 0,
        "displayIndex": 0
      }
    ],
    "classId": 0,
    "authors": [
      {
        "id": 0,
        "name": "string",
        "url": "string"
      }
    ],
    "logo": {
      "id": 0,
      "modId": 0,
      "title": "string",
      "description": "string",
      "thumbnailUrl": "string",
      "url": "string"
    },
    "screenshots": [
      {
        "id": 0,
        "modId": 0,
        "title": "string",
        "description": "string",
        "thumbnailUrl": "string",
        "url": "string"
      }
    ],
    "mainFileId": 0,
    "latestFiles": [
      {
        "id": 0,
        "gameId": 0,
        "modId": 0,
        "isAvailable": true,
        "displayName": "string",
        "fileName": "string",
        "releaseType": 1,
        "fileStatus": 1,
        "hashes": [
          {
            "value": "string",
            "algo": 1
          }
        ],
        "fileDate": "2019-08-24T14:15:22Z",
        "fileLength": 0,
        "downloadCount": 0,
        "fileSizeOnDisk": 0,
        "downloadUrl": "string",
        "gameVersions": [
          "string"
        ],
        "sortableGameVersions": [
          {
            "gameVersionName": "string",
            "gameVersionPadded": "string",
            "gameVersion": "string",
            "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
            "gameVersionTypeId": 0
          }
        ],
        "dependencies": [
          {
            "modId": 0,
            "relationType": 1
          }
        ],
        "exposeAsAlternative": true,
        "parentProjectFileId": 0,
        "alternateFileId": 0,
        "isServerPack": true,
        "serverPackFileId": 0,
        "isEarlyAccessContent": true,
        "earlyAccessEndDate": "2019-08-24T14:15:22Z",
        "fileFingerprint": 0,
        "modules": [
          {
            "name": "string",
            "fingerprint": 0
          }
        ]
      }
    ],
    "latestFilesIndexes": [
      {
        "gameVersion": "string",
        "fileId": 0,
        "filename": "string",
        "releaseType": 1,
        "gameVersionTypeId": 0,
        "modLoader": 0
      }
    ],
    "latestEarlyAccessFilesIndexes": [
      {
        "gameVersion": "string",
        "fileId": 0,
        "filename": "string",
        "releaseType": 1,
        "gameVersionTypeId": 0,
        "modLoader": 0
      }
    ],
    "dateCreated": "2019-08-24T14:15:22Z",
    "dateModified": "2019-08-24T14:15:22Z",
    "dateReleased": "2019-08-24T14:15:22Z",
    "allowModDistribution": true,
    "gamePopularityRank": 0,
    "isAvailable": true,
    "thumbsUpCount": 0,
    "rating": 0
  }
}
Responses
Status	Meaning	Description	Schema
200	OK	none	Get Mod Response
404	Not Found	none	None
500	Internal Server Error	none	None
To perform this operation, you must be authenticated by means of one of the following methods: API_KEY
Get Mods

Code samples

POST /v1/mods HTTP/1.1

Content-Type: application/json
Accept: application/json

POST /v1/mods

Get a list of mods belonging the the same game.

Body parameter

{
  "modIds": [
    0
  ],
  "filterPcOnly": true
}
Parameters
Name	In	Type	Required	Description
body	body	GetModsByIdsListRequestBody	true	Request body containing an array of mod ids, mod ids must belong to the same game.
Example responses

200 Response

{
  "data": [
    {
      "id": 0,
      "gameId": 0,
      "name": "string",
      "slug": "string",
      "links": {
        "websiteUrl": "string",
        "wikiUrl": "string",
        "issuesUrl": "string",
        "sourceUrl": "string"
      },
      "summary": "string",
      "status": 1,
      "downloadCount": 0,
      "isFeatured": true,
      "primaryCategoryId": 0,
      "categories": [
        {
          "id": 0,
          "gameId": 0,
          "name": "string",
          "slug": "string",
          "url": "string",
          "iconUrl": "string",
          "dateModified": "2019-08-24T14:15:22Z",
          "isClass": true,
          "classId": 0,
          "parentCategoryId": 0,
          "displayIndex": 0
        }
      ],
      "classId": 0,
      "authors": [
        {
          "id": 0,
          "name": "string",
          "url": "string"
        }
      ],
      "logo": {
        "id": 0,
        "modId": 0,
        "title": "string",
        "description": "string",
        "thumbnailUrl": "string",
        "url": "string"
      },
      "screenshots": [
        {
          "id": 0,
          "modId": 0,
          "title": "string",
          "description": "string",
          "thumbnailUrl": "string",
          "url": "string"
        }
      ],
      "mainFileId": 0,
      "latestFiles": [
        {
          "id": 0,
          "gameId": 0,
          "modId": 0,
          "isAvailable": true,
          "displayName": "string",
          "fileName": "string",
          "releaseType": 1,
          "fileStatus": 1,
          "hashes": [
            {
              "value": "string",
              "algo": 1
            }
          ],
          "fileDate": "2019-08-24T14:15:22Z",
          "fileLength": 0,
          "downloadCount": 0,
          "fileSizeOnDisk": 0,
          "downloadUrl": "string",
          "gameVersions": [
            "string"
          ],
          "sortableGameVersions": [
            {
              "gameVersionName": "string",
              "gameVersionPadded": "string",
              "gameVersion": "string",
              "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
              "gameVersionTypeId": 0
            }
          ],
          "dependencies": [
            {
              "modId": 0,
              "relationType": 1
            }
          ],
          "exposeAsAlternative": true,
          "parentProjectFileId": 0,
          "alternateFileId": 0,
          "isServerPack": true,
          "serverPackFileId": 0,
          "isEarlyAccessContent": true,
          "earlyAccessEndDate": "2019-08-24T14:15:22Z",
          "fileFingerprint": 0,
          "modules": [
            {
              "name": "string",
              "fingerprint": 0
            }
          ]
        }
      ],
      "latestFilesIndexes": [
        {
          "gameVersion": "string",
          "fileId": 0,
          "filename": "string",
          "releaseType": 1,
          "gameVersionTypeId": 0,
          "modLoader": 0
        }
      ],
      "latestEarlyAccessFilesIndexes": [
        {
          "gameVersion": "string",
          "fileId": 0,
          "filename": "string",
          "releaseType": 1,
          "gameVersionTypeId": 0,
          "modLoader": 0
        }
      ],
      "dateCreated": "2019-08-24T14:15:22Z",
      "dateModified": "2019-08-24T14:15:22Z",
      "dateReleased": "2019-08-24T14:15:22Z",
      "allowModDistribution": true,
      "gamePopularityRank": 0,
      "isAvailable": true,
      "thumbsUpCount": 0,
      "rating": 0
    }
  ]
}
Responses
Status	Meaning	Description	Schema
200	OK	none	Get Mods Response
400	Bad Request	none	None
500	Internal Server Error	none	None
To perform this operation, you must be authenticated by means of one of the following methods: API_KEY
Get Featured Mods

Code samples

POST /v1/mods/featured HTTP/1.1

Content-Type: application/json
Accept: application/json

POST /v1/mods/featured

Get a list of featured, popular and recently updated mods.

Body parameter

{
  "gameId": 0,
  "excludedModIds": [
    0
  ],
  "gameVersionTypeId": 0
}
Parameters
Name	In	Type	Required	Description
body	body	GetFeaturedModsRequestBody	true	Match results for a game and exclude specific mods
Example responses

200 Response

{
  "data": {
    "featured": [
      {
        "id": 0,
        "gameId": 0,
        "name": "string",
        "slug": "string",
        "links": {
          "websiteUrl": "string",
          "wikiUrl": "string",
          "issuesUrl": "string",
          "sourceUrl": "string"
        },
        "summary": "string",
        "status": 1,
        "downloadCount": 0,
        "isFeatured": true,
        "primaryCategoryId": 0,
        "categories": [
          {
            "id": 0,
            "gameId": 0,
            "name": "string",
            "slug": "string",
            "url": "string",
            "iconUrl": "string",
            "dateModified": "2019-08-24T14:15:22Z",
            "isClass": true,
            "classId": 0,
            "parentCategoryId": 0,
            "displayIndex": 0
          }
        ],
        "classId": 0,
        "authors": [
          {
            "id": 0,
            "name": "string",
            "url": "string"
          }
        ],
        "logo": {
          "id": 0,
          "modId": 0,
          "title": "string",
          "description": "string",
          "thumbnailUrl": "string",
          "url": "string"
        },
        "screenshots": [
          {
            "id": 0,
            "modId": 0,
            "title": "string",
            "description": "string",
            "thumbnailUrl": "string",
            "url": "string"
          }
        ],
        "mainFileId": 0,
        "latestFiles": [
          {
            "id": 0,
            "gameId": 0,
            "modId": 0,
            "isAvailable": true,
            "displayName": "string",
            "fileName": "string",
            "releaseType": 1,
            "fileStatus": 1,
            "hashes": [
              {
                "value": "string",
                "algo": 1
              }
            ],
            "fileDate": "2019-08-24T14:15:22Z",
            "fileLength": 0,
            "downloadCount": 0,
            "fileSizeOnDisk": 0,
            "downloadUrl": "string",
            "gameVersions": [
              "string"
            ],
            "sortableGameVersions": [
              {
                "gameVersionName": "string",
                "gameVersionPadded": "string",
                "gameVersion": "string",
                "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
                "gameVersionTypeId": 0
              }
            ],
            "dependencies": [
              {
                "modId": 0,
                "relationType": 1
              }
            ],
            "exposeAsAlternative": true,
            "parentProjectFileId": 0,
            "alternateFileId": 0,
            "isServerPack": true,
            "serverPackFileId": 0,
            "isEarlyAccessContent": true,
            "earlyAccessEndDate": "2019-08-24T14:15:22Z",
            "fileFingerprint": 0,
            "modules": [
              {
                "name": "string",
                "fingerprint": 0
              }
            ]
          }
        ],
        "latestFilesIndexes": [
          {
            "gameVersion": "string",
            "fileId": 0,
            "filename": "string",
            "releaseType": 1,
            "gameVersionTypeId": 0,
            "modLoader": 0
          }
        ],
        "latestEarlyAccessFilesIndexes": [
          {
            "gameVersion": "string",
            "fileId": 0,
            "filename": "string",
            "releaseType": 1,
            "gameVersionTypeId": 0,
            "modLoader": 0
          }
        ],
        "dateCreated": "2019-08-24T14:15:22Z",
        "dateModified": "2019-08-24T14:15:22Z",
        "dateReleased": "2019-08-24T14:15:22Z",
        "allowModDistribution": true,
        "gamePopularityRank": 0,
        "isAvailable": true,
        "thumbsUpCount": 0,
        "rating": 0
      }
    ],
    "popular": [
      {
        "id": 0,
        "gameId": 0,
        "name": "string",
        "slug": "string",
        "links": {
          "websiteUrl": "string",
          "wikiUrl": "string",
          "issuesUrl": "string",
          "sourceUrl": "string"
        },
        "summary": "string",
        "status": 1,
        "downloadCount": 0,
        "isFeatured": true,
        "primaryCategoryId": 0,
        "categories": [
          {
            "id": 0,
            "gameId": 0,
            "name": "string",
            "slug": "string",
            "url": "string",
            "iconUrl": "string",
            "dateModified": "2019-08-24T14:15:22Z",
            "isClass": true,
            "classId": 0,
            "parentCategoryId": 0,
            "displayIndex": 0
          }
        ],
        "classId": 0,
        "authors": [
          {
            "id": 0,
            "name": "string",
            "url": "string"
          }
        ],
        "logo": {
          "id": 0,
          "modId": 0,
          "title": "string",
          "description": "string",
          "thumbnailUrl": "string",
          "url": "string"
        },
        "screenshots": [
          {
            "id": 0,
            "modId": 0,
            "title": "string",
            "description": "string",
            "thumbnailUrl": "string",
            "url": "string"
          }
        ],
        "mainFileId": 0,
        "latestFiles": [
          {
            "id": 0,
            "gameId": 0,
            "modId": 0,
            "isAvailable": true,
            "displayName": "string",
            "fileName": "string",
            "releaseType": 1,
            "fileStatus": 1,
            "hashes": [
              {
                "value": "string",
                "algo": 1
              }
            ],
            "fileDate": "2019-08-24T14:15:22Z",
            "fileLength": 0,
            "downloadCount": 0,
            "fileSizeOnDisk": 0,
            "downloadUrl": "string",
            "gameVersions": [
              "string"
            ],
            "sortableGameVersions": [
              {
                "gameVersionName": "string",
                "gameVersionPadded": "string",
                "gameVersion": "string",
                "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
                "gameVersionTypeId": 0
              }
            ],
            "dependencies": [
              {
                "modId": 0,
                "relationType": 1
              }
            ],
            "exposeAsAlternative": true,
            "parentProjectFileId": 0,
            "alternateFileId": 0,
            "isServerPack": true,
            "serverPackFileId": 0,
            "isEarlyAccessContent": true,
            "earlyAccessEndDate": "2019-08-24T14:15:22Z",
            "fileFingerprint": 0,
            "modules": [
              {
                "name": "string",
                "fingerprint": 0
              }
            ]
          }
        ],
        "latestFilesIndexes": [
          {
            "gameVersion": "string",
            "fileId": 0,
            "filename": "string",
            "releaseType": 1,
            "gameVersionTypeId": 0,
            "modLoader": 0
          }
        ],
        "latestEarlyAccessFilesIndexes": [
          {
            "gameVersion": "string",
            "fileId": 0,
            "filename": "string",
            "releaseType": 1,
            "gameVersionTypeId": 0,
            "modLoader": 0
          }
        ],
        "dateCreated": "2019-08-24T14:15:22Z",
        "dateModified": "2019-08-24T14:15:22Z",
        "dateReleased": "2019-08-24T14:15:22Z",
        "allowModDistribution": true,
        "gamePopularityRank": 0,
        "isAvailable": true,
        "thumbsUpCount": 0,
        "rating": 0
      }
    ],
    "recentlyUpdated": [
      {
        "id": 0,
        "gameId": 0,
        "name": "string",
        "slug": "string",
        "links": {
          "websiteUrl": "string",
          "wikiUrl": "string",
          "issuesUrl": "string",
          "sourceUrl": "string"
        },
        "summary": "string",
        "status": 1,
        "downloadCount": 0,
        "isFeatured": true,
        "primaryCategoryId": 0,
        "categories": [
          {
            "id": 0,
            "gameId": 0,
            "name": "string",
            "slug": "string",
            "url": "string",
            "iconUrl": "string",
            "dateModified": "2019-08-24T14:15:22Z",
            "isClass": true,
            "classId": 0,
            "parentCategoryId": 0,
            "displayIndex": 0
          }
        ],
        "classId": 0,
        "authors": [
          {
            "id": 0,
            "name": "string",
            "url": "string"
          }
        ],
        "logo": {
          "id": 0,
          "modId": 0,
          "title": "string",
          "description": "string",
          "thumbnailUrl": "string",
          "url": "string"
        },
        "screenshots": [
          {
            "id": 0,
            "modId": 0,
            "title": "string",
            "description": "string",
            "thumbnailUrl": "string",
            "url": "string"
          }
        ],
        "mainFileId": 0,
        "latestFiles": [
          {
            "id": 0,
            "gameId": 0,
            "modId": 0,
            "isAvailable": true,
            "displayName": "string",
            "fileName": "string",
            "releaseType": 1,
            "fileStatus": 1,
            "hashes": [
              {
                "value": "string",
                "algo": 1
              }
            ],
            "fileDate": "2019-08-24T14:15:22Z",
            "fileLength": 0,
            "downloadCount": 0,
            "fileSizeOnDisk": 0,
            "downloadUrl": "string",
            "gameVersions": [
              "string"
            ],
            "sortableGameVersions": [
              {
                "gameVersionName": "string",
                "gameVersionPadded": "string",
                "gameVersion": "string",
                "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
                "gameVersionTypeId": 0
              }
            ],
            "dependencies": [
              {
                "modId": 0,
                "relationType": 1
              }
            ],
            "exposeAsAlternative": true,
            "parentProjectFileId": 0,
            "alternateFileId": 0,
            "isServerPack": true,
            "serverPackFileId": 0,
            "isEarlyAccessContent": true,
            "earlyAccessEndDate": "2019-08-24T14:15:22Z",
            "fileFingerprint": 0,
            "modules": [
              {
                "name": "string",
                "fingerprint": 0
              }
            ]
          }
        ],
        "latestFilesIndexes": [
          {
            "gameVersion": "string",
            "fileId": 0,
            "filename": "string",
            "releaseType": 1,
            "gameVersionTypeId": 0,
            "modLoader": 0
          }
        ],
        "latestEarlyAccessFilesIndexes": [
          {
            "gameVersion": "string",
            "fileId": 0,
            "filename": "string",
            "releaseType": 1,
            "gameVersionTypeId": 0,
            "modLoader": 0
          }
        ],
        "dateCreated": "2019-08-24T14:15:22Z",
        "dateModified": "2019-08-24T14:15:22Z",
        "dateReleased": "2019-08-24T14:15:22Z",
        "allowModDistribution": true,
        "gamePopularityRank": 0,
        "isAvailable": true,
        "thumbsUpCount": 0,
        "rating": 0
      }
    ]
  }
}
Responses
Status	Meaning	Description	Schema
200	OK	none	Get Featured Mods Response
400	Bad Request	none	None
404	Not Found	none	None
500	Internal Server Error	none	None
To perform this operation, you must be authenticated by means of one of the following methods: API_KEY
Get Mod Description

Code samples

GET /v1/mods/{modId}/description HTTP/1.1

Accept: application/json

GET /v1/mods/{modId}/description

Get the full description of a mod in HTML format.

Parameters
Name	In	Type	Required	Description
modId	path	integer(int32)	true	The mod id
raw	query	boolean	false	none
stripped	query	boolean	false	none
markup	query	boolean	false	none
Example responses

200 Response

{
  "data": "string"
}
Responses
Status	Meaning	Description	Schema
200	OK	none	String Response
404	Not Found	none	None
500	Internal Server Error	none	None
To perform this operation, you must be authenticated by means of one of the following methods: API_KEY
Files
Get Mod File

Code samples

GET /v1/mods/{modId}/files/{fileId} HTTP/1.1

Accept: application/json

GET /v1/mods/{modId}/files/{fileId}

Get a single file of the specified mod.

Parameters
Name	In	Type	Required	Description
modId	path	integer(int32)	true	The mod id the file belongs to
fileId	path	integer(int32)	true	The file id
Example responses

200 Response

{
  "data": {
    "id": 0,
    "gameId": 0,
    "modId": 0,
    "isAvailable": true,
    "displayName": "string",
    "fileName": "string",
    "releaseType": 1,
    "fileStatus": 1,
    "hashes": [
      {
        "value": "string",
        "algo": 1
      }
    ],
    "fileDate": "2019-08-24T14:15:22Z",
    "fileLength": 0,
    "downloadCount": 0,
    "fileSizeOnDisk": 0,
    "downloadUrl": "string",
    "gameVersions": [
      "string"
    ],
    "sortableGameVersions": [
      {
        "gameVersionName": "string",
        "gameVersionPadded": "string",
        "gameVersion": "string",
        "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
        "gameVersionTypeId": 0
      }
    ],
    "dependencies": [
      {
        "modId": 0,
        "relationType": 1
      }
    ],
    "exposeAsAlternative": true,
    "parentProjectFileId": 0,
    "alternateFileId": 0,
    "isServerPack": true,
    "serverPackFileId": 0,
    "isEarlyAccessContent": true,
    "earlyAccessEndDate": "2019-08-24T14:15:22Z",
    "fileFingerprint": 0,
    "modules": [
      {
        "name": "string",
        "fingerprint": 0
      }
    ]
  }
}
Responses
Status	Meaning	Description	Schema
200	OK	none	Get Mod File Response
404	Not Found	none	None
500	Internal Server Error	none	None
To perform this operation, you must be authenticated by means of one of the following methods: API_KEY
Get Mod Files

Code samples

GET /v1/mods/{modId}/files HTTP/1.1

Accept: application/json

GET /v1/mods/{modId}/files

Get all files of the specified mod.

Parameters
Name	In	Type	Required	Description
modId	path	integer(int32)	true	The mod id the files belong to
gameVersion	query	string	false	Filter by game version string
modLoaderType	query	ModLoaderType	false	ModLoaderType enumeration
gameVersionTypeId	query	integer(int32)	false	Filter only files that are tagged with versions of the given gameVersionTypeId
index	query	integer(int32)	false	A zero based index of the first item to include in the response, the limit is: (index + pageSize <= 10,000).
pageSize	query	integer(int32)	false	The number of items to include in the response, the default/maximum value is 50.
Detailed descriptions
modLoaderType: ModLoaderType enumeration Filter only files associated to a given modloader (Forge, Fabric ...).

Enumerated Values
Parameter	Value
modLoaderType	0
modLoaderType	1
modLoaderType	2
modLoaderType	3
modLoaderType	4
modLoaderType	5
modLoaderType	6
Example responses

200 Response

{
  "data": [
    {
      "id": 0,
      "gameId": 0,
      "modId": 0,
      "isAvailable": true,
      "displayName": "string",
      "fileName": "string",
      "releaseType": 1,
      "fileStatus": 1,
      "hashes": [
        {
          "value": "string",
          "algo": 1
        }
      ],
      "fileDate": "2019-08-24T14:15:22Z",
      "fileLength": 0,
      "downloadCount": 0,
      "fileSizeOnDisk": 0,
      "downloadUrl": "string",
      "gameVersions": [
        "string"
      ],
      "sortableGameVersions": [
        {
          "gameVersionName": "string",
          "gameVersionPadded": "string",
          "gameVersion": "string",
          "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
          "gameVersionTypeId": 0
        }
      ],
      "dependencies": [
        {
          "modId": 0,
          "relationType": 1
        }
      ],
      "exposeAsAlternative": true,
      "parentProjectFileId": 0,
      "alternateFileId": 0,
      "isServerPack": true,
      "serverPackFileId": 0,
      "isEarlyAccessContent": true,
      "earlyAccessEndDate": "2019-08-24T14:15:22Z",
      "fileFingerprint": 0,
      "modules": [
        {
          "name": "string",
          "fingerprint": 0
        }
      ]
    }
  ],
  "pagination": {
    "index": 0,
    "pageSize": 0,
    "resultCount": 0,
    "totalCount": 0
  }
}
Responses
Status	Meaning	Description	Schema
200	OK	none	Get Mod Files Response
404	Not Found	none	None
500	Internal Server Error	none	None
To perform this operation, you must be authenticated by means of one of the following methods: API_KEY
Get Files

Code samples

POST /v1/mods/files HTTP/1.1

Content-Type: application/json
Accept: application/json

POST /v1/mods/files

Get a list of files.

Body parameter

{
  "fileIds": [
    0
  ]
}
Parameters
Name	In	Type	Required	Description
body	body	GetModFilesRequestBody	true	Request body containing a list of file ids to fetch
Example responses

200 Response

{
  "data": [
    {
      "id": 0,
      "gameId": 0,
      "modId": 0,
      "isAvailable": true,
      "displayName": "string",
      "fileName": "string",
      "releaseType": 1,
      "fileStatus": 1,
      "hashes": [
        {
          "value": "string",
          "algo": 1
        }
      ],
      "fileDate": "2019-08-24T14:15:22Z",
      "fileLength": 0,
      "downloadCount": 0,
      "fileSizeOnDisk": 0,
      "downloadUrl": "string",
      "gameVersions": [
        "string"
      ],
      "sortableGameVersions": [
        {
          "gameVersionName": "string",
          "gameVersionPadded": "string",
          "gameVersion": "string",
          "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
          "gameVersionTypeId": 0
        }
      ],
      "dependencies": [
        {
          "modId": 0,
          "relationType": 1
        }
      ],
      "exposeAsAlternative": true,
      "parentProjectFileId": 0,
      "alternateFileId": 0,
      "isServerPack": true,
      "serverPackFileId": 0,
      "isEarlyAccessContent": true,
      "earlyAccessEndDate": "2019-08-24T14:15:22Z",
      "fileFingerprint": 0,
      "modules": [
        {
          "name": "string",
          "fingerprint": 0
        }
      ]
    }
  ]
}
Responses
Status	Meaning	Description	Schema
200	OK	none	Get Files Response
400	Bad Request	none	None
404	Not Found	none	None
500	Internal Server Error	none	None
To perform this operation, you must be authenticated by means of one of the following methods: API_KEY
Get Mod File Changelog

Code samples

GET /v1/mods/{modId}/files/{fileId}/changelog HTTP/1.1

Accept: application/json

GET /v1/mods/{modId}/files/{fileId}/changelog

Get the changelog of a file in HTML format.

Parameters
Name	In	Type	Required	Description
modId	path	integer(int32)	true	The mod id the file belongs to
fileId	path	integer(int32)	true	The file id
Example responses

200 Response

{
  "data": "string"
}
Responses
Status	Meaning	Description	Schema
200	OK	none	String Response
404	Not Found	none	None
500	Internal Server Error	none	None
To perform this operation, you must be authenticated by means of one of the following methods: API_KEY
Get Mod File Download URL

Code samples

GET /v1/mods/{modId}/files/{fileId}/download-url HTTP/1.1

Accept: application/json

GET /v1/mods/{modId}/files/{fileId}/download-url

Get a download url for a specific file.

Parameters
Name	In	Type	Required	Description
modId	path	integer(int32)	true	The mod id the file belongs to
fileId	path	integer(int32)	true	The file id
Example responses

200 Response

{
  "data": "string"
}
Responses
Status	Meaning	Description	Schema
200	OK	none	String Response
404	Not Found	none	None
500	Internal Server Error	none	None
To perform this operation, you must be authenticated by means of one of the following methods: API_KEY
Fingerprints
Get Fingerprints Matches By Game Id

Code samples

POST /v1/fingerprints/{gameId} HTTP/1.1

Content-Type: application/json
Accept: application/json

POST /v1/fingerprints/{gameId}

Get mod files that match a list of fingerprints for a given game id.

Body parameter

{
  "fingerprints": [
    0
  ]
}
Parameters
Name	In	Type	Required	Description
gameId	path	integer(int32)	true	The game id for matching fingerprints
body	body	GetFingerprintMatchesRequestBody	true	The request body containing an array of fingerprints
Example responses

200 Response

{
  "data": {
    "isCacheBuilt": true,
    "exactMatches": [
      {
        "id": 0,
        "file": {
          "id": 0,
          "gameId": 0,
          "modId": 0,
          "isAvailable": true,
          "displayName": "string",
          "fileName": "string",
          "releaseType": 1,
          "fileStatus": 1,
          "hashes": [
            {
              "value": "string",
              "algo": 1
            }
          ],
          "fileDate": "2019-08-24T14:15:22Z",
          "fileLength": 0,
          "downloadCount": 0,
          "fileSizeOnDisk": 0,
          "downloadUrl": "string",
          "gameVersions": [
            "string"
          ],
          "sortableGameVersions": [
            {
              "gameVersionName": "string",
              "gameVersionPadded": "string",
              "gameVersion": "string",
              "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
              "gameVersionTypeId": 0
            }
          ],
          "dependencies": [
            {
              "modId": 0,
              "relationType": 1
            }
          ],
          "exposeAsAlternative": true,
          "parentProjectFileId": 0,
          "alternateFileId": 0,
          "isServerPack": true,
          "serverPackFileId": 0,
          "isEarlyAccessContent": true,
          "earlyAccessEndDate": "2019-08-24T14:15:22Z",
          "fileFingerprint": 0,
          "modules": [
            {
              "name": "string",
              "fingerprint": 0
            }
          ]
        },
        "latestFiles": [
          {
            "id": 0,
            "gameId": 0,
            "modId": 0,
            "isAvailable": true,
            "displayName": "string",
            "fileName": "string",
            "releaseType": 1,
            "fileStatus": 1,
            "hashes": [
              {
                "value": "string",
                "algo": 1
              }
            ],
            "fileDate": "2019-08-24T14:15:22Z",
            "fileLength": 0,
            "downloadCount": 0,
            "fileSizeOnDisk": 0,
            "downloadUrl": "string",
            "gameVersions": [
              "string"
            ],
            "sortableGameVersions": [
              {
                "gameVersionName": "string",
                "gameVersionPadded": "string",
                "gameVersion": "string",
                "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
                "gameVersionTypeId": 0
              }
            ],
            "dependencies": [
              {
                "modId": 0,
                "relationType": 1
              }
            ],
            "exposeAsAlternative": true,
            "parentProjectFileId": 0,
            "alternateFileId": 0,
            "isServerPack": true,
            "serverPackFileId": 0,
            "isEarlyAccessContent": true,
            "earlyAccessEndDate": "2019-08-24T14:15:22Z",
            "fileFingerprint": 0,
            "modules": [
              {
                "name": "string",
                "fingerprint": 0
              }
            ]
          }
        ]
      }
    ],
    "exactFingerprints": [
      0
    ],
    "partialMatches": [
      {
        "id": 0,
        "file": {
          "id": 0,
          "gameId": 0,
          "modId": 0,
          "isAvailable": true,
          "displayName": "string",
          "fileName": "string",
          "releaseType": 1,
          "fileStatus": 1,
          "hashes": [
            {
              "value": "string",
              "algo": 1
            }
          ],
          "fileDate": "2019-08-24T14:15:22Z",
          "fileLength": 0,
          "downloadCount": 0,
          "fileSizeOnDisk": 0,
          "downloadUrl": "string",
          "gameVersions": [
            "string"
          ],
          "sortableGameVersions": [
            {
              "gameVersionName": "string",
              "gameVersionPadded": "string",
              "gameVersion": "string",
              "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
              "gameVersionTypeId": 0
            }
          ],
          "dependencies": [
            {
              "modId": 0,
              "relationType": 1
            }
          ],
          "exposeAsAlternative": true,
          "parentProjectFileId": 0,
          "alternateFileId": 0,
          "isServerPack": true,
          "serverPackFileId": 0,
          "isEarlyAccessContent": true,
          "earlyAccessEndDate": "2019-08-24T14:15:22Z",
          "fileFingerprint": 0,
          "modules": [
            {
              "name": "string",
              "fingerprint": 0
            }
          ]
        },
        "latestFiles": [
          {
            "id": 0,
            "gameId": 0,
            "modId": 0,
            "isAvailable": true,
            "displayName": "string",
            "fileName": "string",
            "releaseType": 1,
            "fileStatus": 1,
            "hashes": [
              {
                "value": "string",
                "algo": 1
              }
            ],
            "fileDate": "2019-08-24T14:15:22Z",
            "fileLength": 0,
            "downloadCount": 0,
            "fileSizeOnDisk": 0,
            "downloadUrl": "string",
            "gameVersions": [
              "string"
            ],
            "sortableGameVersions": [
              {
                "gameVersionName": "string",
                "gameVersionPadded": "string",
                "gameVersion": "string",
                "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
                "gameVersionTypeId": 0
              }
            ],
            "dependencies": [
              {
                "modId": 0,
                "relationType": 1
              }
            ],
            "exposeAsAlternative": true,
            "parentProjectFileId": 0,
            "alternateFileId": 0,
            "isServerPack": true,
            "serverPackFileId": 0,
            "isEarlyAccessContent": true,
            "earlyAccessEndDate": "2019-08-24T14:15:22Z",
            "fileFingerprint": 0,
            "modules": [
              {
                "name": "string",
                "fingerprint": 0
              }
            ]
          }
        ]
      }
    ],
    "partialMatchFingerprints": {
      "property1": [
        0
      ],
      "property2": [
        0
      ]
    },
    "installedFingerprints": [
      0
    ],
    "unmatchedFingerprints": [
      0
    ]
  }
}
Responses
Status	Meaning	Description	Schema
200	OK	none	Get Fingerprint Matches Response
400	Bad Request	none	None
503	Service Unavailable	none	string
To perform this operation, you must be authenticated by means of one of the following methods: API_KEY
Get Fingerprints Matches

Code samples

POST /v1/fingerprints HTTP/1.1

Content-Type: application/json
Accept: application/json

POST /v1/fingerprints

Get mod files that match a list of fingerprints.

Body parameter

{
  "fingerprints": [
    0
  ]
}
Parameters
Name	In	Type	Required	Description
body	body	GetFingerprintMatchesRequestBody	true	The request body containing an array of fingerprints
Example responses

200 Response

{
  "data": {
    "isCacheBuilt": true,
    "exactMatches": [
      {
        "id": 0,
        "file": {
          "id": 0,
          "gameId": 0,
          "modId": 0,
          "isAvailable": true,
          "displayName": "string",
          "fileName": "string",
          "releaseType": 1,
          "fileStatus": 1,
          "hashes": [
            {
              "value": "string",
              "algo": 1
            }
          ],
          "fileDate": "2019-08-24T14:15:22Z",
          "fileLength": 0,
          "downloadCount": 0,
          "fileSizeOnDisk": 0,
          "downloadUrl": "string",
          "gameVersions": [
            "string"
          ],
          "sortableGameVersions": [
            {
              "gameVersionName": "string",
              "gameVersionPadded": "string",
              "gameVersion": "string",
              "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
              "gameVersionTypeId": 0
            }
          ],
          "dependencies": [
            {
              "modId": 0,
              "relationType": 1
            }
          ],
          "exposeAsAlternative": true,
          "parentProjectFileId": 0,
          "alternateFileId": 0,
          "isServerPack": true,
          "serverPackFileId": 0,
          "isEarlyAccessContent": true,
          "earlyAccessEndDate": "2019-08-24T14:15:22Z",
          "fileFingerprint": 0,
          "modules": [
            {
              "name": "string",
              "fingerprint": 0
            }
          ]
        },
        "latestFiles": [
          {
            "id": 0,
            "gameId": 0,
            "modId": 0,
            "isAvailable": true,
            "displayName": "string",
            "fileName": "string",
            "releaseType": 1,
            "fileStatus": 1,
            "hashes": [
              {
                "value": "string",
                "algo": 1
              }
            ],
            "fileDate": "2019-08-24T14:15:22Z",
            "fileLength": 0,
            "downloadCount": 0,
            "fileSizeOnDisk": 0,
            "downloadUrl": "string",
            "gameVersions": [
              "string"
            ],
            "sortableGameVersions": [
              {
                "gameVersionName": "string",
                "gameVersionPadded": "string",
                "gameVersion": "string",
                "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
                "gameVersionTypeId": 0
              }
            ],
            "dependencies": [
              {
                "modId": 0,
                "relationType": 1
              }
            ],
            "exposeAsAlternative": true,
            "parentProjectFileId": 0,
            "alternateFileId": 0,
            "isServerPack": true,
            "serverPackFileId": 0,
            "isEarlyAccessContent": true,
            "earlyAccessEndDate": "2019-08-24T14:15:22Z",
            "fileFingerprint": 0,
            "modules": [
              {
                "name": "string",
                "fingerprint": 0
              }
            ]
          }
        ]
      }
    ],
    "exactFingerprints": [
      0
    ],
    "partialMatches": [
      {
        "id": 0,
        "file": {
          "id": 0,
          "gameId": 0,
          "modId": 0,
          "isAvailable": true,
          "displayName": "string",
          "fileName": "string",
          "releaseType": 1,
          "fileStatus": 1,
          "hashes": [
            {
              "value": "string",
              "algo": 1
            }
          ],
          "fileDate": "2019-08-24T14:15:22Z",
          "fileLength": 0,
          "downloadCount": 0,
          "fileSizeOnDisk": 0,
          "downloadUrl": "string",
          "gameVersions": [
            "string"
          ],
          "sortableGameVersions": [
            {
              "gameVersionName": "string",
              "gameVersionPadded": "string",
              "gameVersion": "string",
              "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
              "gameVersionTypeId": 0
            }
          ],
          "dependencies": [
            {
              "modId": 0,
              "relationType": 1
            }
          ],
          "exposeAsAlternative": true,
          "parentProjectFileId": 0,
          "alternateFileId": 0,
          "isServerPack": true,
          "serverPackFileId": 0,
          "isEarlyAccessContent": true,
          "earlyAccessEndDate": "2019-08-24T14:15:22Z",
          "fileFingerprint": 0,
          "modules": [
            {
              "name": "string",
              "fingerprint": 0
            }
          ]
        },
        "latestFiles": [
          {
            "id": 0,
            "gameId": 0,
            "modId": 0,
            "isAvailable": true,
            "displayName": "string",
            "fileName": "string",
            "releaseType": 1,
            "fileStatus": 1,
            "hashes": [
              {
                "value": "string",
                "algo": 1
              }
            ],
            "fileDate": "2019-08-24T14:15:22Z",
            "fileLength": 0,
            "downloadCount": 0,
            "fileSizeOnDisk": 0,
            "downloadUrl": "string",
            "gameVersions": [
              "string"
            ],
            "sortableGameVersions": [
              {
                "gameVersionName": "string",
                "gameVersionPadded": "string",
                "gameVersion": "string",
                "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
                "gameVersionTypeId": 0
              }
            ],
            "dependencies": [
              {
                "modId": 0,
                "relationType": 1
              }
            ],
            "exposeAsAlternative": true,
            "parentProjectFileId": 0,
            "alternateFileId": 0,
            "isServerPack": true,
            "serverPackFileId": 0,
            "isEarlyAccessContent": true,
            "earlyAccessEndDate": "2019-08-24T14:15:22Z",
            "fileFingerprint": 0,
            "modules": [
              {
                "name": "string",
                "fingerprint": 0
              }
            ]
          }
        ]
      }
    ],
    "partialMatchFingerprints": {
      "property1": [
        0
      ],
      "property2": [
        0
      ]
    },
    "installedFingerprints": [
      0
    ],
    "unmatchedFingerprints": [
      0
    ]
  }
}
Responses
Status	Meaning	Description	Schema
200	OK	none	Get Fingerprint Matches Response
400	Bad Request	none	None
503	Service Unavailable	none	string
To perform this operation, you must be authenticated by means of one of the following methods: API_KEY
Get Fingerprints Fuzzy Matches By Game Id

Code samples

POST /v1/fingerprints/fuzzy/{gameId} HTTP/1.1

Content-Type: application/json
Accept: application/json

POST /v1/fingerprints/fuzzy/{gameId}

Get mod files that match a list of fingerprints using fuzzy matching.

Body parameter

{
  "gameId": 0,
  "fingerprints": [
    {
      "foldername": "string",
      "fingerprints": [
        0
      ]
    }
  ]
}
Parameters
Name	In	Type	Required	Description
gameId	path	integer(int32)	true	The game id for matching fingerprints
body	body	GetFuzzyMatchesRequestBody	true	Game id and folder fingerprints options for the fuzzy matching
Example responses

200 Response

{
  "data": {
    "fuzzyMatches": [
      {
        "id": 0,
        "file": {
          "id": 0,
          "gameId": 0,
          "modId": 0,
          "isAvailable": true,
          "displayName": "string",
          "fileName": "string",
          "releaseType": 1,
          "fileStatus": 1,
          "hashes": [
            {
              "value": "string",
              "algo": 1
            }
          ],
          "fileDate": "2019-08-24T14:15:22Z",
          "fileLength": 0,
          "downloadCount": 0,
          "fileSizeOnDisk": 0,
          "downloadUrl": "string",
          "gameVersions": [
            "string"
          ],
          "sortableGameVersions": [
            {
              "gameVersionName": "string",
              "gameVersionPadded": "string",
              "gameVersion": "string",
              "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
              "gameVersionTypeId": 0
            }
          ],
          "dependencies": [
            {
              "modId": 0,
              "relationType": 1
            }
          ],
          "exposeAsAlternative": true,
          "parentProjectFileId": 0,
          "alternateFileId": 0,
          "isServerPack": true,
          "serverPackFileId": 0,
          "isEarlyAccessContent": true,
          "earlyAccessEndDate": "2019-08-24T14:15:22Z",
          "fileFingerprint": 0,
          "modules": [
            {
              "name": "string",
              "fingerprint": 0
            }
          ]
        },
        "latestFiles": [
          {
            "id": 0,
            "gameId": 0,
            "modId": 0,
            "isAvailable": true,
            "displayName": "string",
            "fileName": "string",
            "releaseType": 1,
            "fileStatus": 1,
            "hashes": [
              {
                "value": "string",
                "algo": 1
              }
            ],
            "fileDate": "2019-08-24T14:15:22Z",
            "fileLength": 0,
            "downloadCount": 0,
            "fileSizeOnDisk": 0,
            "downloadUrl": "string",
            "gameVersions": [
              "string"
            ],
            "sortableGameVersions": [
              {
                "gameVersionName": "string",
                "gameVersionPadded": "string",
                "gameVersion": "string",
                "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
                "gameVersionTypeId": 0
              }
            ],
            "dependencies": [
              {
                "modId": 0,
                "relationType": 1
              }
            ],
            "exposeAsAlternative": true,
            "parentProjectFileId": 0,
            "alternateFileId": 0,
            "isServerPack": true,
            "serverPackFileId": 0,
            "isEarlyAccessContent": true,
            "earlyAccessEndDate": "2019-08-24T14:15:22Z",
            "fileFingerprint": 0,
            "modules": [
              {
                "name": "string",
                "fingerprint": 0
              }
            ]
          }
        ],
        "fingerprints": [
          0
        ]
      }
    ]
  }
}
Responses
Status	Meaning	Description	Schema
200	OK	none	Get Fingerprints Fuzzy Matches Response
400	Bad Request	none	None
503	Service Unavailable	none	string
To perform this operation, you must be authenticated by means of one of the following methods: API_KEY
Get Fingerprints Fuzzy Matches

Code samples

POST /v1/fingerprints/fuzzy HTTP/1.1

Content-Type: application/json
Accept: application/json

POST /v1/fingerprints/fuzzy

Get mod files that match a list of fingerprints using fuzzy matching.

Body parameter

{
  "gameId": 0,
  "fingerprints": [
    {
      "foldername": "string",
      "fingerprints": [
        0
      ]
    }
  ]
}
Parameters
Name	In	Type	Required	Description
body	body	GetFuzzyMatchesRequestBody	true	Game id and folder fingerprints options for the fuzzy matching
Example responses

200 Response

{
  "data": {
    "fuzzyMatches": [
      {
        "id": 0,
        "file": {
          "id": 0,
          "gameId": 0,
          "modId": 0,
          "isAvailable": true,
          "displayName": "string",
          "fileName": "string",
          "releaseType": 1,
          "fileStatus": 1,
          "hashes": [
            {
              "value": "string",
              "algo": 1
            }
          ],
          "fileDate": "2019-08-24T14:15:22Z",
          "fileLength": 0,
          "downloadCount": 0,
          "fileSizeOnDisk": 0,
          "downloadUrl": "string",
          "gameVersions": [
            "string"
          ],
          "sortableGameVersions": [
            {
              "gameVersionName": "string",
              "gameVersionPadded": "string",
              "gameVersion": "string",
              "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
              "gameVersionTypeId": 0
            }
          ],
          "dependencies": [
            {
              "modId": 0,
              "relationType": 1
            }
          ],
          "exposeAsAlternative": true,
          "parentProjectFileId": 0,
          "alternateFileId": 0,
          "isServerPack": true,
          "serverPackFileId": 0,
          "isEarlyAccessContent": true,
          "earlyAccessEndDate": "2019-08-24T14:15:22Z",
          "fileFingerprint": 0,
          "modules": [
            {
              "name": "string",
              "fingerprint": 0
            }
          ]
        },
        "latestFiles": [
          {
            "id": 0,
            "gameId": 0,
            "modId": 0,
            "isAvailable": true,
            "displayName": "string",
            "fileName": "string",
            "releaseType": 1,
            "fileStatus": 1,
            "hashes": [
              {
                "value": "string",
                "algo": 1
              }
            ],
            "fileDate": "2019-08-24T14:15:22Z",
            "fileLength": 0,
            "downloadCount": 0,
            "fileSizeOnDisk": 0,
            "downloadUrl": "string",
            "gameVersions": [
              "string"
            ],
            "sortableGameVersions": [
              {
                "gameVersionName": "string",
                "gameVersionPadded": "string",
                "gameVersion": "string",
                "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
                "gameVersionTypeId": 0
              }
            ],
            "dependencies": [
              {
                "modId": 0,
                "relationType": 1
              }
            ],
            "exposeAsAlternative": true,
            "parentProjectFileId": 0,
            "alternateFileId": 0,
            "isServerPack": true,
            "serverPackFileId": 0,
            "isEarlyAccessContent": true,
            "earlyAccessEndDate": "2019-08-24T14:15:22Z",
            "fileFingerprint": 0,
            "modules": [
              {
                "name": "string",
                "fingerprint": 0
              }
            ]
          }
        ],
        "fingerprints": [
          0
        ]
      }
    ]
  }
}
Responses
Status	Meaning	Description	Schema
200	OK	none	Get Fingerprints Fuzzy Matches Response
400	Bad Request	none	None
503	Service Unavailable	none	string
To perform this operation, you must be authenticated by means of one of the following methods: API_KEY
Minecraft
Get Minecraft Versions

Code samples

GET /v1/minecraft/version HTTP/1.1

Accept: application/json

GET /v1/minecraft/version

Parameters
Name	In	Type	Required	Description
sortDescending	query	boolean	false	none
Example responses

200 Response

{
  "data": [
    {
      "id": 0,
      "gameVersionId": 0,
      "versionString": "string",
      "jarDownloadUrl": "string",
      "jsonDownloadUrl": "string",
      "approved": true,
      "dateModified": "2019-08-24T14:15:22Z",
      "gameVersionTypeId": 0,
      "gameVersionStatus": 1,
      "gameVersionTypeStatus": 1
    }
  ]
}
Responses
Status	Meaning	Description	Schema
200	OK	none	ApiResponseOfListOfMinecraftGameVersion
404	Not Found	none	None
500	Internal Server Error	none	None
To perform this operation, you must be authenticated by means of one of the following methods: API_KEY
Get Specific Minecraft Version

Code samples

GET /v1/minecraft/version/{gameVersionString} HTTP/1.1

Accept: application/json

GET /v1/minecraft/version/{gameVersionString}

Parameters
Name	In	Type	Required	Description
gameVersionString	path	string	true	none
Example responses

200 Response

{
  "data": {
    "id": 0,
    "gameVersionId": 0,
    "versionString": "string",
    "jarDownloadUrl": "string",
    "jsonDownloadUrl": "string",
    "approved": true,
    "dateModified": "2019-08-24T14:15:22Z",
    "gameVersionTypeId": 0,
    "gameVersionStatus": 1,
    "gameVersionTypeStatus": 1
  }
}
Responses
Status	Meaning	Description	Schema
200	OK	none	ApiResponseOfMinecraftGameVersion
404	Not Found	none	None
500	Internal Server Error	none	None
To perform this operation, you must be authenticated by means of one of the following methods: API_KEY
Get Minecraft ModLoaders

Code samples

GET /v1/minecraft/modloader HTTP/1.1

Accept: application/json

GET /v1/minecraft/modloader

Parameters
Name	In	Type	Required	Description
version	query	string	false	none
includeAll	query	boolean	false	none
Example responses

200 Response

{
  "data": [
    {
      "name": "string",
      "gameVersion": "string",
      "latest": true,
      "recommended": true,
      "dateModified": "2019-08-24T14:15:22Z",
      "type": 0
    }
  ]
}
Responses
Status	Meaning	Description	Schema
200	OK	none	ApiResponseOfListOfMinecraftModLoaderIndex
404	Not Found	none	None
500	Internal Server Error	none	None
To perform this operation, you must be authenticated by means of one of the following methods: API_KEY
Get Specific Minecraft ModLoader

Code samples

GET /v1/minecraft/modloader/{modLoaderName} HTTP/1.1

Accept: application/json

GET /v1/minecraft/modloader/{modLoaderName}

Parameters
Name	In	Type	Required	Description
modLoaderName	path	string	true	none
Example responses

200 Response

{
  "data": {
    "id": 0,
    "gameVersionId": 0,
    "minecraftGameVersionId": 0,
    "forgeVersion": "string",
    "name": "string",
    "type": 0,
    "downloadUrl": "string",
    "filename": "string",
    "installMethod": 1,
    "latest": true,
    "recommended": true,
    "approved": true,
    "dateModified": "2019-08-24T14:15:22Z",
    "mavenVersionString": "string",
    "versionJson": "string",
    "librariesInstallLocation": "string",
    "minecraftVersion": "string",
    "additionalFilesJson": "string",
    "modLoaderGameVersionId": 0,
    "modLoaderGameVersionTypeId": 0,
    "modLoaderGameVersionStatus": 1,
    "modLoaderGameVersionTypeStatus": 1,
    "mcGameVersionId": 0,
    "mcGameVersionTypeId": 0,
    "mcGameVersionStatus": 1,
    "mcGameVersionTypeStatus": 1,
    "installProfileJson": "string"
  }
}
Responses
Status	Meaning	Description	Schema
200	OK	none	ApiResponseOfMinecraftModLoaderVersion
404	Not Found	none	None
500	Internal Server Error	none	None
To perform this operation, you must be authenticated by means of one of the following methods: API_KEY
Schemas
ApiResponseOfListOfMinecraftGameVersion

{
  "data": [
    {
      "id": 0,
      "gameVersionId": 0,
      "versionString": "string",
      "jarDownloadUrl": "string",
      "jsonDownloadUrl": "string",
      "approved": true,
      "dateModified": "2019-08-24T14:15:22Z",
      "gameVersionTypeId": 0,
      "gameVersionStatus": 1,
      "gameVersionTypeStatus": 1
    }
  ]
}

Properties
Name	Type	Description
data	[MinecraftGameVersion]	The response data
ApiResponseOfListOfMinecraftModLoaderIndex

{
  "data": [
    {
      "name": "string",
      "gameVersion": "string",
      "latest": true,
      "recommended": true,
      "dateModified": "2019-08-24T14:15:22Z",
      "type": 0
    }
  ]
}

Properties
Name	Type	Description
data	[MinecraftModLoaderIndex]	The response data
ApiResponseOfMinecraftGameVersion

{
  "data": {
    "id": 0,
    "gameVersionId": 0,
    "versionString": "string",
    "jarDownloadUrl": "string",
    "jsonDownloadUrl": "string",
    "approved": true,
    "dateModified": "2019-08-24T14:15:22Z",
    "gameVersionTypeId": 0,
    "gameVersionStatus": 1,
    "gameVersionTypeStatus": 1
  }
}

Properties
Name	Type	Description
data	MinecraftGameVersion	The response data
ApiResponseOfMinecraftModLoaderVersion

{
  "data": {
    "id": 0,
    "gameVersionId": 0,
    "minecraftGameVersionId": 0,
    "forgeVersion": "string",
    "name": "string",
    "type": 0,
    "downloadUrl": "string",
    "filename": "string",
    "installMethod": 1,
    "latest": true,
    "recommended": true,
    "approved": true,
    "dateModified": "2019-08-24T14:15:22Z",
    "mavenVersionString": "string",
    "versionJson": "string",
    "librariesInstallLocation": "string",
    "minecraftVersion": "string",
    "additionalFilesJson": "string",
    "modLoaderGameVersionId": 0,
    "modLoaderGameVersionTypeId": 0,
    "modLoaderGameVersionStatus": 1,
    "modLoaderGameVersionTypeStatus": 1,
    "mcGameVersionId": 0,
    "mcGameVersionTypeId": 0,
    "mcGameVersionStatus": 1,
    "mcGameVersionTypeStatus": 1,
    "installProfileJson": "string"
  }
}

Properties
Name	Type	Description
data	MinecraftModLoaderVersion	The response data
Category

{
  "id": 0,
  "gameId": 0,
  "name": "string",
  "slug": "string",
  "url": "string",
  "iconUrl": "string",
  "dateModified": "2019-08-24T14:15:22Z",
  "isClass": true,
  "classId": 0,
  "parentCategoryId": 0,
  "displayIndex": 0
}

Properties
Name	Type	Description
id	integer(int32)	The category id
gameId	integer(int32)	The game id related to the category
name	string	Category name
slug	string	The category slug as it appear in the URL
url	string	The category URL
iconUrl	string	URL for the category icon
dateModified	string(date-time)	Last modified date of the category
isClass	boolean¦null	A top level category for other categories
classId	integer(int32)¦null	The class id of the category, meaning - the class of which this category is under
parentCategoryId	integer(int32)¦null	The parent category for this category
displayIndex	integer(int32)¦null	The display index for this category
CoreApiStatus

1

Possible enum values:

1=Private

2=Public

CoreStatus

1

Possible enum values:

1=Draft

2=Test

3=PendingReview

4=Rejected

5=Approved

6=Live

FeaturedModsResponse

{
  "featured": [
    {
      "id": 0,
      "gameId": 0,
      "name": "string",
      "slug": "string",
      "links": {
        "websiteUrl": "string",
        "wikiUrl": "string",
        "issuesUrl": "string",
        "sourceUrl": "string"
      },
      "summary": "string",
      "status": 1,
      "downloadCount": 0,
      "isFeatured": true,
      "primaryCategoryId": 0,
      "categories": [
        {
          "id": 0,
          "gameId": 0,
          "name": "string",
          "slug": "string",
          "url": "string",
          "iconUrl": "string",
          "dateModified": "2019-08-24T14:15:22Z",
          "isClass": true,
          "classId": 0,
          "parentCategoryId": 0,
          "displayIndex": 0
        }
      ],
      "classId": 0,
      "authors": [
        {
          "id": 0,
          "name": "string",
          "url": "string"
        }
      ],
      "logo": {
        "id": 0,
        "modId": 0,
        "title": "string",
        "description": "string",
        "thumbnailUrl": "string",
        "url": "string"
      },
      "screenshots": [
        {
          "id": 0,
          "modId": 0,
          "title": "string",
          "description": "string",
          "thumbnailUrl": "string",
          "url": "string"
        }
      ],
      "mainFileId": 0,
      "latestFiles": [
        {
          "id": 0,
          "gameId": 0,
          "modId": 0,
          "isAvailable": true,
          "displayName": "string",
          "fileName": "string",
          "releaseType": 1,
          "fileStatus": 1,
          "hashes": [
            {
              "value": "string",
              "algo": 1
            }
          ],
          "fileDate": "2019-08-24T14:15:22Z",
          "fileLength": 0,
          "downloadCount": 0,
          "fileSizeOnDisk": 0,
          "downloadUrl": "string",
          "gameVersions": [
            "string"
          ],
          "sortableGameVersions": [
            {
              "gameVersionName": "string",
              "gameVersionPadded": "string",
              "gameVersion": "string",
              "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
              "gameVersionTypeId": 0
            }
          ],
          "dependencies": [
            {
              "modId": 0,
              "relationType": 1
            }
          ],
          "exposeAsAlternative": true,
          "parentProjectFileId": 0,
          "alternateFileId": 0,
          "isServerPack": true,
          "serverPackFileId": 0,
          "isEarlyAccessContent": true,
          "earlyAccessEndDate": "2019-08-24T14:15:22Z",
          "fileFingerprint": 0,
          "modules": [
            {
              "name": "string",
              "fingerprint": 0
            }
          ]
        }
      ],
      "latestFilesIndexes": [
        {
          "gameVersion": "string",
          "fileId": 0,
          "filename": "string",
          "releaseType": 1,
          "gameVersionTypeId": 0,
          "modLoader": 0
        }
      ],
      "latestEarlyAccessFilesIndexes": [
        {
          "gameVersion": "string",
          "fileId": 0,
          "filename": "string",
          "releaseType": 1,
          "gameVersionTypeId": 0,
          "modLoader": 0
        }
      ],
      "dateCreated": "2019-08-24T14:15:22Z",
      "dateModified": "2019-08-24T14:15:22Z",
      "dateReleased": "2019-08-24T14:15:22Z",
      "allowModDistribution": true,
      "gamePopularityRank": 0,
      "isAvailable": true,
      "thumbsUpCount": 0,
      "rating": 0
    }
  ],
  "popular": [
    {
      "id": 0,
      "gameId": 0,
      "name": "string",
      "slug": "string",
      "links": {
        "websiteUrl": "string",
        "wikiUrl": "string",
        "issuesUrl": "string",
        "sourceUrl": "string"
      },
      "summary": "string",
      "status": 1,
      "downloadCount": 0,
      "isFeatured": true,
      "primaryCategoryId": 0,
      "categories": [
        {
          "id": 0,
          "gameId": 0,
          "name": "string",
          "slug": "string",
          "url": "string",
          "iconUrl": "string",
          "dateModified": "2019-08-24T14:15:22Z",
          "isClass": true,
          "classId": 0,
          "parentCategoryId": 0,
          "displayIndex": 0
        }
      ],
      "classId": 0,
      "authors": [
        {
          "id": 0,
          "name": "string",
          "url": "string"
        }
      ],
      "logo": {
        "id": 0,
        "modId": 0,
        "title": "string",
        "description": "string",
        "thumbnailUrl": "string",
        "url": "string"
      },
      "screenshots": [
        {
          "id": 0,
          "modId": 0,
          "title": "string",
          "description": "string",
          "thumbnailUrl": "string",
          "url": "string"
        }
      ],
      "mainFileId": 0,
      "latestFiles": [
        {
          "id": 0,
          "gameId": 0,
          "modId": 0,
          "isAvailable": true,
          "displayName": "string",
          "fileName": "string",
          "releaseType": 1,
          "fileStatus": 1,
          "hashes": [
            {
              "value": "string",
              "algo": 1
            }
          ],
          "fileDate": "2019-08-24T14:15:22Z",
          "fileLength": 0,
          "downloadCount": 0,
          "fileSizeOnDisk": 0,
          "downloadUrl": "string",
          "gameVersions": [
            "string"
          ],
          "sortableGameVersions": [
            {
              "gameVersionName": "string",
              "gameVersionPadded": "string",
              "gameVersion": "string",
              "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
              "gameVersionTypeId": 0
            }
          ],
          "dependencies": [
            {
              "modId": 0,
              "relationType": 1
            }
          ],
          "exposeAsAlternative": true,
          "parentProjectFileId": 0,
          "alternateFileId": 0,
          "isServerPack": true,
          "serverPackFileId": 0,
          "isEarlyAccessContent": true,
          "earlyAccessEndDate": "2019-08-24T14:15:22Z",
          "fileFingerprint": 0,
          "modules": [
            {
              "name": "string",
              "fingerprint": 0
            }
          ]
        }
      ],
      "latestFilesIndexes": [
        {
          "gameVersion": "string",
          "fileId": 0,
          "filename": "string",
          "releaseType": 1,
          "gameVersionTypeId": 0,
          "modLoader": 0
        }
      ],
      "latestEarlyAccessFilesIndexes": [
        {
          "gameVersion": "string",
          "fileId": 0,
          "filename": "string",
          "releaseType": 1,
          "gameVersionTypeId": 0,
          "modLoader": 0
        }
      ],
      "dateCreated": "2019-08-24T14:15:22Z",
      "dateModified": "2019-08-24T14:15:22Z",
      "dateReleased": "2019-08-24T14:15:22Z",
      "allowModDistribution": true,
      "gamePopularityRank": 0,
      "isAvailable": true,
      "thumbsUpCount": 0,
      "rating": 0
    }
  ],
  "recentlyUpdated": [
    {
      "id": 0,
      "gameId": 0,
      "name": "string",
      "slug": "string",
      "links": {
        "websiteUrl": "string",
        "wikiUrl": "string",
        "issuesUrl": "string",
        "sourceUrl": "string"
      },
      "summary": "string",
      "status": 1,
      "downloadCount": 0,
      "isFeatured": true,
      "primaryCategoryId": 0,
      "categories": [
        {
          "id": 0,
          "gameId": 0,
          "name": "string",
          "slug": "string",
          "url": "string",
          "iconUrl": "string",
          "dateModified": "2019-08-24T14:15:22Z",
          "isClass": true,
          "classId": 0,
          "parentCategoryId": 0,
          "displayIndex": 0
        }
      ],
      "classId": 0,
      "authors": [
        {
          "id": 0,
          "name": "string",
          "url": "string"
        }
      ],
      "logo": {
        "id": 0,
        "modId": 0,
        "title": "string",
        "description": "string",
        "thumbnailUrl": "string",
        "url": "string"
      },
      "screenshots": [
        {
          "id": 0,
          "modId": 0,
          "title": "string",
          "description": "string",
          "thumbnailUrl": "string",
          "url": "string"
        }
      ],
      "mainFileId": 0,
      "latestFiles": [
        {
          "id": 0,
          "gameId": 0,
          "modId": 0,
          "isAvailable": true,
          "displayName": "string",
          "fileName": "string",
          "releaseType": 1,
          "fileStatus": 1,
          "hashes": [
            {
              "value": "string",
              "algo": 1
            }
          ],
          "fileDate": "2019-08-24T14:15:22Z",
          "fileLength": 0,
          "downloadCount": 0,
          "fileSizeOnDisk": 0,
          "downloadUrl": "string",
          "gameVersions": [
            "string"
          ],
          "sortableGameVersions": [
            {
              "gameVersionName": "string",
              "gameVersionPadded": "string",
              "gameVersion": "string",
              "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
              "gameVersionTypeId": 0
            }
          ],
          "dependencies": [
            {
              "modId": 0,
              "relationType": 1
            }
          ],
          "exposeAsAlternative": true,
          "parentProjectFileId": 0,
          "alternateFileId": 0,
          "isServerPack": true,
          "serverPackFileId": 0,
          "isEarlyAccessContent": true,
          "earlyAccessEndDate": "2019-08-24T14:15:22Z",
          "fileFingerprint": 0,
          "modules": [
            {
              "name": "string",
              "fingerprint": 0
            }
          ]
        }
      ],
      "latestFilesIndexes": [
        {
          "gameVersion": "string",
          "fileId": 0,
          "filename": "string",
          "releaseType": 1,
          "gameVersionTypeId": 0,
          "modLoader": 0
        }
      ],
      "latestEarlyAccessFilesIndexes": [
        {
          "gameVersion": "string",
          "fileId": 0,
          "filename": "string",
          "releaseType": 1,
          "gameVersionTypeId": 0,
          "modLoader": 0
        }
      ],
      "dateCreated": "2019-08-24T14:15:22Z",
      "dateModified": "2019-08-24T14:15:22Z",
      "dateReleased": "2019-08-24T14:15:22Z",
      "allowModDistribution": true,
      "gamePopularityRank": 0,
      "isAvailable": true,
      "thumbsUpCount": 0,
      "rating": 0
    }
  ]
}

Properties
Name	Type	Description
featured	[Mod]	none
popular	[Mod]	none
recentlyUpdated	[Mod]	none
File

{
  "id": 0,
  "gameId": 0,
  "modId": 0,
  "isAvailable": true,
  "displayName": "string",
  "fileName": "string",
  "releaseType": 1,
  "fileStatus": 1,
  "hashes": [
    {
      "value": "string",
      "algo": 1
    }
  ],
  "fileDate": "2019-08-24T14:15:22Z",
  "fileLength": 0,
  "downloadCount": 0,
  "fileSizeOnDisk": 0,
  "downloadUrl": "string",
  "gameVersions": [
    "string"
  ],
  "sortableGameVersions": [
    {
      "gameVersionName": "string",
      "gameVersionPadded": "string",
      "gameVersion": "string",
      "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
      "gameVersionTypeId": 0
    }
  ],
  "dependencies": [
    {
      "modId": 0,
      "relationType": 1
    }
  ],
  "exposeAsAlternative": true,
  "parentProjectFileId": 0,
  "alternateFileId": 0,
  "isServerPack": true,
  "serverPackFileId": 0,
  "isEarlyAccessContent": true,
  "earlyAccessEndDate": "2019-08-24T14:15:22Z",
  "fileFingerprint": 0,
  "modules": [
    {
      "name": "string",
      "fingerprint": 0
    }
  ]
}

Properties
Name	Type	Description
id	integer(int32)	The file id
gameId	integer(int32)	The game id related to the mod that this file belongs to
modId	integer(int32)	The mod id
isAvailable	boolean	Whether the file is available to download
displayName	string	Display name of the file
fileName	string	Exact file name
releaseType	FileReleaseType	The file release type
fileStatus	FileStatus	Status of the file
hashes	[FileHash]	The file hash (i.e. md5 or sha1)
fileDate	string(date-time)	The file timestamp
fileLength	integer(int64)	The file length in bytes
downloadCount	integer(int64)	The number of downloads for the file
fileSizeOnDisk	integer(int64)¦null	The file's size on disk
downloadUrl	string	The file download URL
gameVersions	[string]	List of game versions this file is relevant for
sortableGameVersions	[SortableGameVersion]	Metadata used for sorting by game versions
dependencies	[FileDependency]	List of dependencies files
exposeAsAlternative	boolean¦null	none
parentProjectFileId	integer(int32)¦null	none
alternateFileId	integer(int32)¦null	none
isServerPack	boolean¦null	none
serverPackFileId	integer(int32)¦null	none
isEarlyAccessContent	boolean¦null	none
earlyAccessEndDate	string(date-time)¦null	none
fileFingerprint	integer(int64)	none
modules	[FileModule]	none
FileDependency

{
  "modId": 0,
  "relationType": 1
}

Properties
Name	Type	Description
modId	integer(int32)	none
relationType	FileRelationType	1 = EmbeddedLibrary
2 = OptionalDependency
3 = RequiredDependency
4 = Tool
5 = Incompatible
6 = Include
FileHash

{
  "value": "string",
  "algo": 1
}

Properties
Name	Type	Description
value	string	none
algo	HashAlgo	1 = Sha1
2 = Md5
FileIndex

{
  "gameVersion": "string",
  "fileId": 0,
  "filename": "string",
  "releaseType": 1,
  "gameVersionTypeId": 0,
  "modLoader": 0
}

Properties
Name	Type	Description
gameVersion	string	none
fileId	integer(int32)	none
filename	string	none
releaseType	FileReleaseType	1 = Release
2 = Beta
3 = Alpha
gameVersionTypeId	integer(int32)¦null	none
modLoader	ModLoaderType	0 = Any
1 = Forge
2 = Cauldron
3 = LiteLoader
4 = Fabric
5 = Quilt
6 = NeoForge
FileModule

{
  "name": "string",
  "fingerprint": 0
}

Properties
Name	Type	Description
name	string	none
fingerprint	integer(int64)	none
FileRelationType

1

Possible enum values:

1=EmbeddedLibrary

2=OptionalDependency

3=RequiredDependency

4=Tool

5=Incompatible

6=Include

FileReleaseType

1

Possible enum values:

1=Release

2=Beta

3=Alpha

FileStatus

1

Possible enum values:

1=Processing

2=ChangesRequired

3=UnderReview

4=Approved

5=Rejected

6=MalwareDetected

7=Deleted

8=Archived

9=Testing

10=Released

11=ReadyForReview

12=Deprecated

13=Baking

14=AwaitingPublishing

15=FailedPublishing

16=Cooking

17=Cooked

18=UnderManualReview

19=ScanningForMalware

20=ProcessingFile

21=PendingRelease

22=ReadyForCooking

23=PostProcessing

FingerprintFuzzyMatch

{
  "id": 0,
  "file": {
    "id": 0,
    "gameId": 0,
    "modId": 0,
    "isAvailable": true,
    "displayName": "string",
    "fileName": "string",
    "releaseType": 1,
    "fileStatus": 1,
    "hashes": [
      {
        "value": "string",
        "algo": 1
      }
    ],
    "fileDate": "2019-08-24T14:15:22Z",
    "fileLength": 0,
    "downloadCount": 0,
    "fileSizeOnDisk": 0,
    "downloadUrl": "string",
    "gameVersions": [
      "string"
    ],
    "sortableGameVersions": [
      {
        "gameVersionName": "string",
        "gameVersionPadded": "string",
        "gameVersion": "string",
        "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
        "gameVersionTypeId": 0
      }
    ],
    "dependencies": [
      {
        "modId": 0,
        "relationType": 1
      }
    ],
    "exposeAsAlternative": true,
    "parentProjectFileId": 0,
    "alternateFileId": 0,
    "isServerPack": true,
    "serverPackFileId": 0,
    "isEarlyAccessContent": true,
    "earlyAccessEndDate": "2019-08-24T14:15:22Z",
    "fileFingerprint": 0,
    "modules": [
      {
        "name": "string",
        "fingerprint": 0
      }
    ]
  },
  "latestFiles": [
    {
      "id": 0,
      "gameId": 0,
      "modId": 0,
      "isAvailable": true,
      "displayName": "string",
      "fileName": "string",
      "releaseType": 1,
      "fileStatus": 1,
      "hashes": [
        {
          "value": "string",
          "algo": 1
        }
      ],
      "fileDate": "2019-08-24T14:15:22Z",
      "fileLength": 0,
      "downloadCount": 0,
      "fileSizeOnDisk": 0,
      "downloadUrl": "string",
      "gameVersions": [
        "string"
      ],
      "sortableGameVersions": [
        {
          "gameVersionName": "string",
          "gameVersionPadded": "string",
          "gameVersion": "string",
          "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
          "gameVersionTypeId": 0
        }
      ],
      "dependencies": [
        {
          "modId": 0,
          "relationType": 1
        }
      ],
      "exposeAsAlternative": true,
      "parentProjectFileId": 0,
      "alternateFileId": 0,
      "isServerPack": true,
      "serverPackFileId": 0,
      "isEarlyAccessContent": true,
      "earlyAccessEndDate": "2019-08-24T14:15:22Z",
      "fileFingerprint": 0,
      "modules": [
        {
          "name": "string",
          "fingerprint": 0
        }
      ]
    }
  ],
  "fingerprints": [
    0
  ]
}

Properties
Name	Type	Description
id	integer(int32)	none
file	File	none
latestFiles	[File]	none
fingerprints	[integer]	none
FingerprintFuzzyMatchResult

{
  "fuzzyMatches": [
    {
      "id": 0,
      "file": {
        "id": 0,
        "gameId": 0,
        "modId": 0,
        "isAvailable": true,
        "displayName": "string",
        "fileName": "string",
        "releaseType": 1,
        "fileStatus": 1,
        "hashes": [
          {
            "value": "string",
            "algo": 1
          }
        ],
        "fileDate": "2019-08-24T14:15:22Z",
        "fileLength": 0,
        "downloadCount": 0,
        "fileSizeOnDisk": 0,
        "downloadUrl": "string",
        "gameVersions": [
          "string"
        ],
        "sortableGameVersions": [
          {
            "gameVersionName": "string",
            "gameVersionPadded": "string",
            "gameVersion": "string",
            "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
            "gameVersionTypeId": 0
          }
        ],
        "dependencies": [
          {
            "modId": 0,
            "relationType": 1
          }
        ],
        "exposeAsAlternative": true,
        "parentProjectFileId": 0,
        "alternateFileId": 0,
        "isServerPack": true,
        "serverPackFileId": 0,
        "isEarlyAccessContent": true,
        "earlyAccessEndDate": "2019-08-24T14:15:22Z",
        "fileFingerprint": 0,
        "modules": [
          {
            "name": "string",
            "fingerprint": 0
          }
        ]
      },
      "latestFiles": [
        {
          "id": 0,
          "gameId": 0,
          "modId": 0,
          "isAvailable": true,
          "displayName": "string",
          "fileName": "string",
          "releaseType": 1,
          "fileStatus": 1,
          "hashes": [
            {
              "value": "string",
              "algo": 1
            }
          ],
          "fileDate": "2019-08-24T14:15:22Z",
          "fileLength": 0,
          "downloadCount": 0,
          "fileSizeOnDisk": 0,
          "downloadUrl": "string",
          "gameVersions": [
            "string"
          ],
          "sortableGameVersions": [
            {
              "gameVersionName": "string",
              "gameVersionPadded": "string",
              "gameVersion": "string",
              "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
              "gameVersionTypeId": 0
            }
          ],
          "dependencies": [
            {
              "modId": 0,
              "relationType": 1
            }
          ],
          "exposeAsAlternative": true,
          "parentProjectFileId": 0,
          "alternateFileId": 0,
          "isServerPack": true,
          "serverPackFileId": 0,
          "isEarlyAccessContent": true,
          "earlyAccessEndDate": "2019-08-24T14:15:22Z",
          "fileFingerprint": 0,
          "modules": [
            {
              "name": "string",
              "fingerprint": 0
            }
          ]
        }
      ],
      "fingerprints": [
        0
      ]
    }
  ]
}

Properties
Name	Type	Description
fuzzyMatches	[FingerprintFuzzyMatch]	none
FingerprintMatch

{
  "id": 0,
  "file": {
    "id": 0,
    "gameId": 0,
    "modId": 0,
    "isAvailable": true,
    "displayName": "string",
    "fileName": "string",
    "releaseType": 1,
    "fileStatus": 1,
    "hashes": [
      {
        "value": "string",
        "algo": 1
      }
    ],
    "fileDate": "2019-08-24T14:15:22Z",
    "fileLength": 0,
    "downloadCount": 0,
    "fileSizeOnDisk": 0,
    "downloadUrl": "string",
    "gameVersions": [
      "string"
    ],
    "sortableGameVersions": [
      {
        "gameVersionName": "string",
        "gameVersionPadded": "string",
        "gameVersion": "string",
        "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
        "gameVersionTypeId": 0
      }
    ],
    "dependencies": [
      {
        "modId": 0,
        "relationType": 1
      }
    ],
    "exposeAsAlternative": true,
    "parentProjectFileId": 0,
    "alternateFileId": 0,
    "isServerPack": true,
    "serverPackFileId": 0,
    "isEarlyAccessContent": true,
    "earlyAccessEndDate": "2019-08-24T14:15:22Z",
    "fileFingerprint": 0,
    "modules": [
      {
        "name": "string",
        "fingerprint": 0
      }
    ]
  },
  "latestFiles": [
    {
      "id": 0,
      "gameId": 0,
      "modId": 0,
      "isAvailable": true,
      "displayName": "string",
      "fileName": "string",
      "releaseType": 1,
      "fileStatus": 1,
      "hashes": [
        {
          "value": "string",
          "algo": 1
        }
      ],
      "fileDate": "2019-08-24T14:15:22Z",
      "fileLength": 0,
      "downloadCount": 0,
      "fileSizeOnDisk": 0,
      "downloadUrl": "string",
      "gameVersions": [
        "string"
      ],
      "sortableGameVersions": [
        {
          "gameVersionName": "string",
          "gameVersionPadded": "string",
          "gameVersion": "string",
          "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
          "gameVersionTypeId": 0
        }
      ],
      "dependencies": [
        {
          "modId": 0,
          "relationType": 1
        }
      ],
      "exposeAsAlternative": true,
      "parentProjectFileId": 0,
      "alternateFileId": 0,
      "isServerPack": true,
      "serverPackFileId": 0,
      "isEarlyAccessContent": true,
      "earlyAccessEndDate": "2019-08-24T14:15:22Z",
      "fileFingerprint": 0,
      "modules": [
        {
          "name": "string",
          "fingerprint": 0
        }
      ]
    }
  ]
}

Properties
Name	Type	Description
id	integer(int32)	none
file	File	none
latestFiles	[File]	none
FingerprintsMatchesResult

{
  "isCacheBuilt": true,
  "exactMatches": [
    {
      "id": 0,
      "file": {
        "id": 0,
        "gameId": 0,
        "modId": 0,
        "isAvailable": true,
        "displayName": "string",
        "fileName": "string",
        "releaseType": 1,
        "fileStatus": 1,
        "hashes": [
          {
            "value": "string",
            "algo": 1
          }
        ],
        "fileDate": "2019-08-24T14:15:22Z",
        "fileLength": 0,
        "downloadCount": 0,
        "fileSizeOnDisk": 0,
        "downloadUrl": "string",
        "gameVersions": [
          "string"
        ],
        "sortableGameVersions": [
          {
            "gameVersionName": "string",
            "gameVersionPadded": "string",
            "gameVersion": "string",
            "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
            "gameVersionTypeId": 0
          }
        ],
        "dependencies": [
          {
            "modId": 0,
            "relationType": 1
          }
        ],
        "exposeAsAlternative": true,
        "parentProjectFileId": 0,
        "alternateFileId": 0,
        "isServerPack": true,
        "serverPackFileId": 0,
        "isEarlyAccessContent": true,
        "earlyAccessEndDate": "2019-08-24T14:15:22Z",
        "fileFingerprint": 0,
        "modules": [
          {
            "name": "string",
            "fingerprint": 0
          }
        ]
      },
      "latestFiles": [
        {
          "id": 0,
          "gameId": 0,
          "modId": 0,
          "isAvailable": true,
          "displayName": "string",
          "fileName": "string",
          "releaseType": 1,
          "fileStatus": 1,
          "hashes": [
            {
              "value": "string",
              "algo": 1
            }
          ],
          "fileDate": "2019-08-24T14:15:22Z",
          "fileLength": 0,
          "downloadCount": 0,
          "fileSizeOnDisk": 0,
          "downloadUrl": "string",
          "gameVersions": [
            "string"
          ],
          "sortableGameVersions": [
            {
              "gameVersionName": "string",
              "gameVersionPadded": "string",
              "gameVersion": "string",
              "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
              "gameVersionTypeId": 0
            }
          ],
          "dependencies": [
            {
              "modId": 0,
              "relationType": 1
            }
          ],
          "exposeAsAlternative": true,
          "parentProjectFileId": 0,
          "alternateFileId": 0,
          "isServerPack": true,
          "serverPackFileId": 0,
          "isEarlyAccessContent": true,
          "earlyAccessEndDate": "2019-08-24T14:15:22Z",
          "fileFingerprint": 0,
          "modules": [
            {
              "name": "string",
              "fingerprint": 0
            }
          ]
        }
      ]
    }
  ],
  "exactFingerprints": [
    0
  ],
  "partialMatches": [
    {
      "id": 0,
      "file": {
        "id": 0,
        "gameId": 0,
        "modId": 0,
        "isAvailable": true,
        "displayName": "string",
        "fileName": "string",
        "releaseType": 1,
        "fileStatus": 1,
        "hashes": [
          {
            "value": "string",
            "algo": 1
          }
        ],
        "fileDate": "2019-08-24T14:15:22Z",
        "fileLength": 0,
        "downloadCount": 0,
        "fileSizeOnDisk": 0,
        "downloadUrl": "string",
        "gameVersions": [
          "string"
        ],
        "sortableGameVersions": [
          {
            "gameVersionName": "string",
            "gameVersionPadded": "string",
            "gameVersion": "string",
            "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
            "gameVersionTypeId": 0
          }
        ],
        "dependencies": [
          {
            "modId": 0,
            "relationType": 1
          }
        ],
        "exposeAsAlternative": true,
        "parentProjectFileId": 0,
        "alternateFileId": 0,
        "isServerPack": true,
        "serverPackFileId": 0,
        "isEarlyAccessContent": true,
        "earlyAccessEndDate": "2019-08-24T14:15:22Z",
        "fileFingerprint": 0,
        "modules": [
          {
            "name": "string",
            "fingerprint": 0
          }
        ]
      },
      "latestFiles": [
        {
          "id": 0,
          "gameId": 0,
          "modId": 0,
          "isAvailable": true,
          "displayName": "string",
          "fileName": "string",
          "releaseType": 1,
          "fileStatus": 1,
          "hashes": [
            {
              "value": "string",
              "algo": 1
            }
          ],
          "fileDate": "2019-08-24T14:15:22Z",
          "fileLength": 0,
          "downloadCount": 0,
          "fileSizeOnDisk": 0,
          "downloadUrl": "string",
          "gameVersions": [
            "string"
          ],
          "sortableGameVersions": [
            {
              "gameVersionName": "string",
              "gameVersionPadded": "string",
              "gameVersion": "string",
              "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
              "gameVersionTypeId": 0
            }
          ],
          "dependencies": [
            {
              "modId": 0,
              "relationType": 1
            }
          ],
          "exposeAsAlternative": true,
          "parentProjectFileId": 0,
          "alternateFileId": 0,
          "isServerPack": true,
          "serverPackFileId": 0,
          "isEarlyAccessContent": true,
          "earlyAccessEndDate": "2019-08-24T14:15:22Z",
          "fileFingerprint": 0,
          "modules": [
            {
              "name": "string",
              "fingerprint": 0
            }
          ]
        }
      ]
    }
  ],
  "partialMatchFingerprints": {
    "property1": [
      0
    ],
    "property2": [
      0
    ]
  },
  "installedFingerprints": [
    0
  ],
  "unmatchedFingerprints": [
    0
  ]
}

Properties
Name	Type	Description
isCacheBuilt	boolean	none
exactMatches	[FingerprintMatch]	none
exactFingerprints	[integer]	none
partialMatches	[FingerprintMatch]	none
partialMatchFingerprints	object	none
» additionalProperties	[integer]	none
installedFingerprints	[integer]	none
unmatchedFingerprints	[integer]	none
FolderFingerprint

{
  "foldername": "string",
  "fingerprints": [
    0
  ]
}

Properties
Name	Type	Description
foldername	string	none
fingerprints	[integer]	none
Game

{
  "id": 0,
  "name": "string",
  "slug": "string",
  "dateModified": "2019-08-24T14:15:22Z",
  "assets": {
    "iconUrl": "string",
    "tileUrl": "string",
    "coverUrl": "string"
  },
  "status": 1,
  "apiStatus": 1
}

Properties
Name	Type	Description
id	integer(int32)	none
name	string	none
slug	string	none
dateModified	string(date-time)	none
assets	GameAssets	none
status	CoreStatus	1 = Draft
2 = Test
3 = PendingReview
4 = Rejected
5 = Approved
6 = Live
apiStatus	CoreApiStatus	1 = Private
2 = Public
GameAssets

{
  "iconUrl": "string",
  "tileUrl": "string",
  "coverUrl": "string"
}

Properties
Name	Type	Description
iconUrl	string	none
tileUrl	string	none
coverUrl	string	none
GameVersion

{
  "id": 0,
  "slug": "string",
  "name": "string"
}

Properties
Name	Type	Description
id	integer(int32)	none
slug	string	none
name	string	none
GameVersionsByType

{
  "type": 0,
  "versions": [
    "string"
  ]
}

Properties
Name	Type	Description
type	integer(int32)	none
versions	[string]	none
GameVersionsByType2

{
  "type": 0,
  "versions": [
    {
      "id": 0,
      "slug": "string",
      "name": "string"
    }
  ]
}

Properties
Name	Type	Description
type	integer(int32)	none
versions	[GameVersion]	none
GameVersionStatus

1

Possible enum values:

1=Approved

2=Deleted

3=New

GameVersionType

{
  "id": 0,
  "gameId": 0,
  "name": "string",
  "slug": "string",
  "isSyncable": true,
  "status": 1
}

Properties
Name	Type	Description
id	integer(int32)	none
gameId	integer(int32)	none
name	string	none
slug	string	none
isSyncable	boolean	none
status	GameVersionTypeStatus	1 = Normal
2 = Deleted
GameVersionTypeStatus

1

Possible enum values:

1=Normal

2=Deleted

Get Categories Response

{
  "data": [
    {
      "id": 0,
      "gameId": 0,
      "name": "string",
      "slug": "string",
      "url": "string",
      "iconUrl": "string",
      "dateModified": "2019-08-24T14:15:22Z",
      "isClass": true,
      "classId": 0,
      "parentCategoryId": 0,
      "displayIndex": 0
    }
  ]
}

Properties
Name	Type	Description
data	[Category]	The response data
Get Featured Mods Response

{
  "data": {
    "featured": [
      {
        "id": 0,
        "gameId": 0,
        "name": "string",
        "slug": "string",
        "links": {
          "websiteUrl": "string",
          "wikiUrl": "string",
          "issuesUrl": "string",
          "sourceUrl": "string"
        },
        "summary": "string",
        "status": 1,
        "downloadCount": 0,
        "isFeatured": true,
        "primaryCategoryId": 0,
        "categories": [
          {
            "id": 0,
            "gameId": 0,
            "name": "string",
            "slug": "string",
            "url": "string",
            "iconUrl": "string",
            "dateModified": "2019-08-24T14:15:22Z",
            "isClass": true,
            "classId": 0,
            "parentCategoryId": 0,
            "displayIndex": 0
          }
        ],
        "classId": 0,
        "authors": [
          {
            "id": 0,
            "name": "string",
            "url": "string"
          }
        ],
        "logo": {
          "id": 0,
          "modId": 0,
          "title": "string",
          "description": "string",
          "thumbnailUrl": "string",
          "url": "string"
        },
        "screenshots": [
          {
            "id": 0,
            "modId": 0,
            "title": "string",
            "description": "string",
            "thumbnailUrl": "string",
            "url": "string"
          }
        ],
        "mainFileId": 0,
        "latestFiles": [
          {
            "id": 0,
            "gameId": 0,
            "modId": 0,
            "isAvailable": true,
            "displayName": "string",
            "fileName": "string",
            "releaseType": 1,
            "fileStatus": 1,
            "hashes": [
              {
                "value": "string",
                "algo": 1
              }
            ],
            "fileDate": "2019-08-24T14:15:22Z",
            "fileLength": 0,
            "downloadCount": 0,
            "fileSizeOnDisk": 0,
            "downloadUrl": "string",
            "gameVersions": [
              "string"
            ],
            "sortableGameVersions": [
              {
                "gameVersionName": "string",
                "gameVersionPadded": "string",
                "gameVersion": "string",
                "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
                "gameVersionTypeId": 0
              }
            ],
            "dependencies": [
              {
                "modId": 0,
                "relationType": 1
              }
            ],
            "exposeAsAlternative": true,
            "parentProjectFileId": 0,
            "alternateFileId": 0,
            "isServerPack": true,
            "serverPackFileId": 0,
            "isEarlyAccessContent": true,
            "earlyAccessEndDate": "2019-08-24T14:15:22Z",
            "fileFingerprint": 0,
            "modules": [
              {
                "name": "string",
                "fingerprint": 0
              }
            ]
          }
        ],
        "latestFilesIndexes": [
          {
            "gameVersion": "string",
            "fileId": 0,
            "filename": "string",
            "releaseType": 1,
            "gameVersionTypeId": 0,
            "modLoader": 0
          }
        ],
        "latestEarlyAccessFilesIndexes": [
          {
            "gameVersion": "string",
            "fileId": 0,
            "filename": "string",
            "releaseType": 1,
            "gameVersionTypeId": 0,
            "modLoader": 0
          }
        ],
        "dateCreated": "2019-08-24T14:15:22Z",
        "dateModified": "2019-08-24T14:15:22Z",
        "dateReleased": "2019-08-24T14:15:22Z",
        "allowModDistribution": true,
        "gamePopularityRank": 0,
        "isAvailable": true,
        "thumbsUpCount": 0,
        "rating": 0
      }
    ],
    "popular": [
      {
        "id": 0,
        "gameId": 0,
        "name": "string",
        "slug": "string",
        "links": {
          "websiteUrl": "string",
          "wikiUrl": "string",
          "issuesUrl": "string",
          "sourceUrl": "string"
        },
        "summary": "string",
        "status": 1,
        "downloadCount": 0,
        "isFeatured": true,
        "primaryCategoryId": 0,
        "categories": [
          {
            "id": 0,
            "gameId": 0,
            "name": "string",
            "slug": "string",
            "url": "string",
            "iconUrl": "string",
            "dateModified": "2019-08-24T14:15:22Z",
            "isClass": true,
            "classId": 0,
            "parentCategoryId": 0,
            "displayIndex": 0
          }
        ],
        "classId": 0,
        "authors": [
          {
            "id": 0,
            "name": "string",
            "url": "string"
          }
        ],
        "logo": {
          "id": 0,
          "modId": 0,
          "title": "string",
          "description": "string",
          "thumbnailUrl": "string",
          "url": "string"
        },
        "screenshots": [
          {
            "id": 0,
            "modId": 0,
            "title": "string",
            "description": "string",
            "thumbnailUrl": "string",
            "url": "string"
          }
        ],
        "mainFileId": 0,
        "latestFiles": [
          {
            "id": 0,
            "gameId": 0,
            "modId": 0,
            "isAvailable": true,
            "displayName": "string",
            "fileName": "string",
            "releaseType": 1,
            "fileStatus": 1,
            "hashes": [
              {
                "value": "string",
                "algo": 1
              }
            ],
            "fileDate": "2019-08-24T14:15:22Z",
            "fileLength": 0,
            "downloadCount": 0,
            "fileSizeOnDisk": 0,
            "downloadUrl": "string",
            "gameVersions": [
              "string"
            ],
            "sortableGameVersions": [
              {
                "gameVersionName": "string",
                "gameVersionPadded": "string",
                "gameVersion": "string",
                "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
                "gameVersionTypeId": 0
              }
            ],
            "dependencies": [
              {
                "modId": 0,
                "relationType": 1
              }
            ],
            "exposeAsAlternative": true,
            "parentProjectFileId": 0,
            "alternateFileId": 0,
            "isServerPack": true,
            "serverPackFileId": 0,
            "isEarlyAccessContent": true,
            "earlyAccessEndDate": "2019-08-24T14:15:22Z",
            "fileFingerprint": 0,
            "modules": [
              {
                "name": "string",
                "fingerprint": 0
              }
            ]
          }
        ],
        "latestFilesIndexes": [
          {
            "gameVersion": "string",
            "fileId": 0,
            "filename": "string",
            "releaseType": 1,
            "gameVersionTypeId": 0,
            "modLoader": 0
          }
        ],
        "latestEarlyAccessFilesIndexes": [
          {
            "gameVersion": "string",
            "fileId": 0,
            "filename": "string",
            "releaseType": 1,
            "gameVersionTypeId": 0,
            "modLoader": 0
          }
        ],
        "dateCreated": "2019-08-24T14:15:22Z",
        "dateModified": "2019-08-24T14:15:22Z",
        "dateReleased": "2019-08-24T14:15:22Z",
        "allowModDistribution": true,
        "gamePopularityRank": 0,
        "isAvailable": true,
        "thumbsUpCount": 0,
        "rating": 0
      }
    ],
    "recentlyUpdated": [
      {
        "id": 0,
        "gameId": 0,
        "name": "string",
        "slug": "string",
        "links": {
          "websiteUrl": "string",
          "wikiUrl": "string",
          "issuesUrl": "string",
          "sourceUrl": "string"
        },
        "summary": "string",
        "status": 1,
        "downloadCount": 0,
        "isFeatured": true,
        "primaryCategoryId": 0,
        "categories": [
          {
            "id": 0,
            "gameId": 0,
            "name": "string",
            "slug": "string",
            "url": "string",
            "iconUrl": "string",
            "dateModified": "2019-08-24T14:15:22Z",
            "isClass": true,
            "classId": 0,
            "parentCategoryId": 0,
            "displayIndex": 0
          }
        ],
        "classId": 0,
        "authors": [
          {
            "id": 0,
            "name": "string",
            "url": "string"
          }
        ],
        "logo": {
          "id": 0,
          "modId": 0,
          "title": "string",
          "description": "string",
          "thumbnailUrl": "string",
          "url": "string"
        },
        "screenshots": [
          {
            "id": 0,
            "modId": 0,
            "title": "string",
            "description": "string",
            "thumbnailUrl": "string",
            "url": "string"
          }
        ],
        "mainFileId": 0,
        "latestFiles": [
          {
            "id": 0,
            "gameId": 0,
            "modId": 0,
            "isAvailable": true,
            "displayName": "string",
            "fileName": "string",
            "releaseType": 1,
            "fileStatus": 1,
            "hashes": [
              {
                "value": "string",
                "algo": 1
              }
            ],
            "fileDate": "2019-08-24T14:15:22Z",
            "fileLength": 0,
            "downloadCount": 0,
            "fileSizeOnDisk": 0,
            "downloadUrl": "string",
            "gameVersions": [
              "string"
            ],
            "sortableGameVersions": [
              {
                "gameVersionName": "string",
                "gameVersionPadded": "string",
                "gameVersion": "string",
                "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
                "gameVersionTypeId": 0
              }
            ],
            "dependencies": [
              {
                "modId": 0,
                "relationType": 1
              }
            ],
            "exposeAsAlternative": true,
            "parentProjectFileId": 0,
            "alternateFileId": 0,
            "isServerPack": true,
            "serverPackFileId": 0,
            "isEarlyAccessContent": true,
            "earlyAccessEndDate": "2019-08-24T14:15:22Z",
            "fileFingerprint": 0,
            "modules": [
              {
                "name": "string",
                "fingerprint": 0
              }
            ]
          }
        ],
        "latestFilesIndexes": [
          {
            "gameVersion": "string",
            "fileId": 0,
            "filename": "string",
            "releaseType": 1,
            "gameVersionTypeId": 0,
            "modLoader": 0
          }
        ],
        "latestEarlyAccessFilesIndexes": [
          {
            "gameVersion": "string",
            "fileId": 0,
            "filename": "string",
            "releaseType": 1,
            "gameVersionTypeId": 0,
            "modLoader": 0
          }
        ],
        "dateCreated": "2019-08-24T14:15:22Z",
        "dateModified": "2019-08-24T14:15:22Z",
        "dateReleased": "2019-08-24T14:15:22Z",
        "allowModDistribution": true,
        "gamePopularityRank": 0,
        "isAvailable": true,
        "thumbsUpCount": 0,
        "rating": 0
      }
    ]
  }
}

Properties
Name	Type	Description
data	FeaturedModsResponse	The response data
Get Files Response

{
  "data": [
    {
      "id": 0,
      "gameId": 0,
      "modId": 0,
      "isAvailable": true,
      "displayName": "string",
      "fileName": "string",
      "releaseType": 1,
      "fileStatus": 1,
      "hashes": [
        {
          "value": "string",
          "algo": 1
        }
      ],
      "fileDate": "2019-08-24T14:15:22Z",
      "fileLength": 0,
      "downloadCount": 0,
      "fileSizeOnDisk": 0,
      "downloadUrl": "string",
      "gameVersions": [
        "string"
      ],
      "sortableGameVersions": [
        {
          "gameVersionName": "string",
          "gameVersionPadded": "string",
          "gameVersion": "string",
          "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
          "gameVersionTypeId": 0
        }
      ],
      "dependencies": [
        {
          "modId": 0,
          "relationType": 1
        }
      ],
      "exposeAsAlternative": true,
      "parentProjectFileId": 0,
      "alternateFileId": 0,
      "isServerPack": true,
      "serverPackFileId": 0,
      "isEarlyAccessContent": true,
      "earlyAccessEndDate": "2019-08-24T14:15:22Z",
      "fileFingerprint": 0,
      "modules": [
        {
          "name": "string",
          "fingerprint": 0
        }
      ]
    }
  ]
}

Properties
Name	Type	Description
data	[File]	The response data
Get Fingerprint Matches Response

{
  "data": {
    "isCacheBuilt": true,
    "exactMatches": [
      {
        "id": 0,
        "file": {
          "id": 0,
          "gameId": 0,
          "modId": 0,
          "isAvailable": true,
          "displayName": "string",
          "fileName": "string",
          "releaseType": 1,
          "fileStatus": 1,
          "hashes": [
            {
              "value": "string",
              "algo": 1
            }
          ],
          "fileDate": "2019-08-24T14:15:22Z",
          "fileLength": 0,
          "downloadCount": 0,
          "fileSizeOnDisk": 0,
          "downloadUrl": "string",
          "gameVersions": [
            "string"
          ],
          "sortableGameVersions": [
            {
              "gameVersionName": "string",
              "gameVersionPadded": "string",
              "gameVersion": "string",
              "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
              "gameVersionTypeId": 0
            }
          ],
          "dependencies": [
            {
              "modId": 0,
              "relationType": 1
            }
          ],
          "exposeAsAlternative": true,
          "parentProjectFileId": 0,
          "alternateFileId": 0,
          "isServerPack": true,
          "serverPackFileId": 0,
          "isEarlyAccessContent": true,
          "earlyAccessEndDate": "2019-08-24T14:15:22Z",
          "fileFingerprint": 0,
          "modules": [
            {
              "name": "string",
              "fingerprint": 0
            }
          ]
        },
        "latestFiles": [
          {
            "id": 0,
            "gameId": 0,
            "modId": 0,
            "isAvailable": true,
            "displayName": "string",
            "fileName": "string",
            "releaseType": 1,
            "fileStatus": 1,
            "hashes": [
              {
                "value": "string",
                "algo": 1
              }
            ],
            "fileDate": "2019-08-24T14:15:22Z",
            "fileLength": 0,
            "downloadCount": 0,
            "fileSizeOnDisk": 0,
            "downloadUrl": "string",
            "gameVersions": [
              "string"
            ],
            "sortableGameVersions": [
              {
                "gameVersionName": "string",
                "gameVersionPadded": "string",
                "gameVersion": "string",
                "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
                "gameVersionTypeId": 0
              }
            ],
            "dependencies": [
              {
                "modId": 0,
                "relationType": 1
              }
            ],
            "exposeAsAlternative": true,
            "parentProjectFileId": 0,
            "alternateFileId": 0,
            "isServerPack": true,
            "serverPackFileId": 0,
            "isEarlyAccessContent": true,
            "earlyAccessEndDate": "2019-08-24T14:15:22Z",
            "fileFingerprint": 0,
            "modules": [
              {
                "name": "string",
                "fingerprint": 0
              }
            ]
          }
        ]
      }
    ],
    "exactFingerprints": [
      0
    ],
    "partialMatches": [
      {
        "id": 0,
        "file": {
          "id": 0,
          "gameId": 0,
          "modId": 0,
          "isAvailable": true,
          "displayName": "string",
          "fileName": "string",
          "releaseType": 1,
          "fileStatus": 1,
          "hashes": [
            {
              "value": "string",
              "algo": 1
            }
          ],
          "fileDate": "2019-08-24T14:15:22Z",
          "fileLength": 0,
          "downloadCount": 0,
          "fileSizeOnDisk": 0,
          "downloadUrl": "string",
          "gameVersions": [
            "string"
          ],
          "sortableGameVersions": [
            {
              "gameVersionName": "string",
              "gameVersionPadded": "string",
              "gameVersion": "string",
              "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
              "gameVersionTypeId": 0
            }
          ],
          "dependencies": [
            {
              "modId": 0,
              "relationType": 1
            }
          ],
          "exposeAsAlternative": true,
          "parentProjectFileId": 0,
          "alternateFileId": 0,
          "isServerPack": true,
          "serverPackFileId": 0,
          "isEarlyAccessContent": true,
          "earlyAccessEndDate": "2019-08-24T14:15:22Z",
          "fileFingerprint": 0,
          "modules": [
            {
              "name": "string",
              "fingerprint": 0
            }
          ]
        },
        "latestFiles": [
          {
            "id": 0,
            "gameId": 0,
            "modId": 0,
            "isAvailable": true,
            "displayName": "string",
            "fileName": "string",
            "releaseType": 1,
            "fileStatus": 1,
            "hashes": [
              {
                "value": "string",
                "algo": 1
              }
            ],
            "fileDate": "2019-08-24T14:15:22Z",
            "fileLength": 0,
            "downloadCount": 0,
            "fileSizeOnDisk": 0,
            "downloadUrl": "string",
            "gameVersions": [
              "string"
            ],
            "sortableGameVersions": [
              {
                "gameVersionName": "string",
                "gameVersionPadded": "string",
                "gameVersion": "string",
                "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
                "gameVersionTypeId": 0
              }
            ],
            "dependencies": [
              {
                "modId": 0,
                "relationType": 1
              }
            ],
            "exposeAsAlternative": true,
            "parentProjectFileId": 0,
            "alternateFileId": 0,
            "isServerPack": true,
            "serverPackFileId": 0,
            "isEarlyAccessContent": true,
            "earlyAccessEndDate": "2019-08-24T14:15:22Z",
            "fileFingerprint": 0,
            "modules": [
              {
                "name": "string",
                "fingerprint": 0
              }
            ]
          }
        ]
      }
    ],
    "partialMatchFingerprints": {
      "property1": [
        0
      ],
      "property2": [
        0
      ]
    },
    "installedFingerprints": [
      0
    ],
    "unmatchedFingerprints": [
      0
    ]
  }
}

Properties
Name	Type	Description
data	FingerprintsMatchesResult	The response data
Get Fingerprints Fuzzy Matches Response

{
  "data": {
    "fuzzyMatches": [
      {
        "id": 0,
        "file": {
          "id": 0,
          "gameId": 0,
          "modId": 0,
          "isAvailable": true,
          "displayName": "string",
          "fileName": "string",
          "releaseType": 1,
          "fileStatus": 1,
          "hashes": [
            {
              "value": "string",
              "algo": 1
            }
          ],
          "fileDate": "2019-08-24T14:15:22Z",
          "fileLength": 0,
          "downloadCount": 0,
          "fileSizeOnDisk": 0,
          "downloadUrl": "string",
          "gameVersions": [
            "string"
          ],
          "sortableGameVersions": [
            {
              "gameVersionName": "string",
              "gameVersionPadded": "string",
              "gameVersion": "string",
              "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
              "gameVersionTypeId": 0
            }
          ],
          "dependencies": [
            {
              "modId": 0,
              "relationType": 1
            }
          ],
          "exposeAsAlternative": true,
          "parentProjectFileId": 0,
          "alternateFileId": 0,
          "isServerPack": true,
          "serverPackFileId": 0,
          "isEarlyAccessContent": true,
          "earlyAccessEndDate": "2019-08-24T14:15:22Z",
          "fileFingerprint": 0,
          "modules": [
            {
              "name": "string",
              "fingerprint": 0
            }
          ]
        },
        "latestFiles": [
          {
            "id": 0,
            "gameId": 0,
            "modId": 0,
            "isAvailable": true,
            "displayName": "string",
            "fileName": "string",
            "releaseType": 1,
            "fileStatus": 1,
            "hashes": [
              {
                "value": "string",
                "algo": 1
              }
            ],
            "fileDate": "2019-08-24T14:15:22Z",
            "fileLength": 0,
            "downloadCount": 0,
            "fileSizeOnDisk": 0,
            "downloadUrl": "string",
            "gameVersions": [
              "string"
            ],
            "sortableGameVersions": [
              {
                "gameVersionName": "string",
                "gameVersionPadded": "string",
                "gameVersion": "string",
                "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
                "gameVersionTypeId": 0
              }
            ],
            "dependencies": [
              {
                "modId": 0,
                "relationType": 1
              }
            ],
            "exposeAsAlternative": true,
            "parentProjectFileId": 0,
            "alternateFileId": 0,
            "isServerPack": true,
            "serverPackFileId": 0,
            "isEarlyAccessContent": true,
            "earlyAccessEndDate": "2019-08-24T14:15:22Z",
            "fileFingerprint": 0,
            "modules": [
              {
                "name": "string",
                "fingerprint": 0
              }
            ]
          }
        ],
        "fingerprints": [
          0
        ]
      }
    ]
  }
}

Properties
Name	Type	Description
data	FingerprintFuzzyMatchResult	The response data
Get Game Response

{
  "data": {
    "id": 0,
    "name": "string",
    "slug": "string",
    "dateModified": "2019-08-24T14:15:22Z",
    "assets": {
      "iconUrl": "string",
      "tileUrl": "string",
      "coverUrl": "string"
    },
    "status": 1,
    "apiStatus": 1
  }
}

Properties
Name	Type	Description
data	Game	The response data
Get Games Response

{
  "data": [
    {
      "id": 0,
      "name": "string",
      "slug": "string",
      "dateModified": "2019-08-24T14:15:22Z",
      "assets": {
        "iconUrl": "string",
        "tileUrl": "string",
        "coverUrl": "string"
      },
      "status": 1,
      "apiStatus": 1
    }
  ],
  "pagination": {
    "index": 0,
    "pageSize": 0,
    "resultCount": 0,
    "totalCount": 0
  }
}

Properties
Name	Type	Description
data	[Game]	The response data
pagination	Pagination	The response pagination information
Get Mod File Response

{
  "data": {
    "id": 0,
    "gameId": 0,
    "modId": 0,
    "isAvailable": true,
    "displayName": "string",
    "fileName": "string",
    "releaseType": 1,
    "fileStatus": 1,
    "hashes": [
      {
        "value": "string",
        "algo": 1
      }
    ],
    "fileDate": "2019-08-24T14:15:22Z",
    "fileLength": 0,
    "downloadCount": 0,
    "fileSizeOnDisk": 0,
    "downloadUrl": "string",
    "gameVersions": [
      "string"
    ],
    "sortableGameVersions": [
      {
        "gameVersionName": "string",
        "gameVersionPadded": "string",
        "gameVersion": "string",
        "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
        "gameVersionTypeId": 0
      }
    ],
    "dependencies": [
      {
        "modId": 0,
        "relationType": 1
      }
    ],
    "exposeAsAlternative": true,
    "parentProjectFileId": 0,
    "alternateFileId": 0,
    "isServerPack": true,
    "serverPackFileId": 0,
    "isEarlyAccessContent": true,
    "earlyAccessEndDate": "2019-08-24T14:15:22Z",
    "fileFingerprint": 0,
    "modules": [
      {
        "name": "string",
        "fingerprint": 0
      }
    ]
  }
}

Properties
Name	Type	Description
data	File	The response data
Get Mod Files Response

{
  "data": [
    {
      "id": 0,
      "gameId": 0,
      "modId": 0,
      "isAvailable": true,
      "displayName": "string",
      "fileName": "string",
      "releaseType": 1,
      "fileStatus": 1,
      "hashes": [
        {
          "value": "string",
          "algo": 1
        }
      ],
      "fileDate": "2019-08-24T14:15:22Z",
      "fileLength": 0,
      "downloadCount": 0,
      "fileSizeOnDisk": 0,
      "downloadUrl": "string",
      "gameVersions": [
        "string"
      ],
      "sortableGameVersions": [
        {
          "gameVersionName": "string",
          "gameVersionPadded": "string",
          "gameVersion": "string",
          "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
          "gameVersionTypeId": 0
        }
      ],
      "dependencies": [
        {
          "modId": 0,
          "relationType": 1
        }
      ],
      "exposeAsAlternative": true,
      "parentProjectFileId": 0,
      "alternateFileId": 0,
      "isServerPack": true,
      "serverPackFileId": 0,
      "isEarlyAccessContent": true,
      "earlyAccessEndDate": "2019-08-24T14:15:22Z",
      "fileFingerprint": 0,
      "modules": [
        {
          "name": "string",
          "fingerprint": 0
        }
      ]
    }
  ],
  "pagination": {
    "index": 0,
    "pageSize": 0,
    "resultCount": 0,
    "totalCount": 0
  }
}

Properties
Name	Type	Description
data	[File]	The response data
pagination	Pagination	The response pagination information
Get Mod Response

{
  "data": {
    "id": 0,
    "gameId": 0,
    "name": "string",
    "slug": "string",
    "links": {
      "websiteUrl": "string",
      "wikiUrl": "string",
      "issuesUrl": "string",
      "sourceUrl": "string"
    },
    "summary": "string",
    "status": 1,
    "downloadCount": 0,
    "isFeatured": true,
    "primaryCategoryId": 0,
    "categories": [
      {
        "id": 0,
        "gameId": 0,
        "name": "string",
        "slug": "string",
        "url": "string",
        "iconUrl": "string",
        "dateModified": "2019-08-24T14:15:22Z",
        "isClass": true,
        "classId": 0,
        "parentCategoryId": 0,
        "displayIndex": 0
      }
    ],
    "classId": 0,
    "authors": [
      {
        "id": 0,
        "name": "string",
        "url": "string"
      }
    ],
    "logo": {
      "id": 0,
      "modId": 0,
      "title": "string",
      "description": "string",
      "thumbnailUrl": "string",
      "url": "string"
    },
    "screenshots": [
      {
        "id": 0,
        "modId": 0,
        "title": "string",
        "description": "string",
        "thumbnailUrl": "string",
        "url": "string"
      }
    ],
    "mainFileId": 0,
    "latestFiles": [
      {
        "id": 0,
        "gameId": 0,
        "modId": 0,
        "isAvailable": true,
        "displayName": "string",
        "fileName": "string",
        "releaseType": 1,
        "fileStatus": 1,
        "hashes": [
          {
            "value": "string",
            "algo": 1
          }
        ],
        "fileDate": "2019-08-24T14:15:22Z",
        "fileLength": 0,
        "downloadCount": 0,
        "fileSizeOnDisk": 0,
        "downloadUrl": "string",
        "gameVersions": [
          "string"
        ],
        "sortableGameVersions": [
          {
            "gameVersionName": "string",
            "gameVersionPadded": "string",
            "gameVersion": "string",
            "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
            "gameVersionTypeId": 0
          }
        ],
        "dependencies": [
          {
            "modId": 0,
            "relationType": 1
          }
        ],
        "exposeAsAlternative": true,
        "parentProjectFileId": 0,
        "alternateFileId": 0,
        "isServerPack": true,
        "serverPackFileId": 0,
        "isEarlyAccessContent": true,
        "earlyAccessEndDate": "2019-08-24T14:15:22Z",
        "fileFingerprint": 0,
        "modules": [
          {
            "name": "string",
            "fingerprint": 0
          }
        ]
      }
    ],
    "latestFilesIndexes": [
      {
        "gameVersion": "string",
        "fileId": 0,
        "filename": "string",
        "releaseType": 1,
        "gameVersionTypeId": 0,
        "modLoader": 0
      }
    ],
    "latestEarlyAccessFilesIndexes": [
      {
        "gameVersion": "string",
        "fileId": 0,
        "filename": "string",
        "releaseType": 1,
        "gameVersionTypeId": 0,
        "modLoader": 0
      }
    ],
    "dateCreated": "2019-08-24T14:15:22Z",
    "dateModified": "2019-08-24T14:15:22Z",
    "dateReleased": "2019-08-24T14:15:22Z",
    "allowModDistribution": true,
    "gamePopularityRank": 0,
    "isAvailable": true,
    "thumbsUpCount": 0,
    "rating": 0
  }
}

Properties
Name	Type	Description
data	Mod	The response data
Get Mods Response

{
  "data": [
    {
      "id": 0,
      "gameId": 0,
      "name": "string",
      "slug": "string",
      "links": {
        "websiteUrl": "string",
        "wikiUrl": "string",
        "issuesUrl": "string",
        "sourceUrl": "string"
      },
      "summary": "string",
      "status": 1,
      "downloadCount": 0,
      "isFeatured": true,
      "primaryCategoryId": 0,
      "categories": [
        {
          "id": 0,
          "gameId": 0,
          "name": "string",
          "slug": "string",
          "url": "string",
          "iconUrl": "string",
          "dateModified": "2019-08-24T14:15:22Z",
          "isClass": true,
          "classId": 0,
          "parentCategoryId": 0,
          "displayIndex": 0
        }
      ],
      "classId": 0,
      "authors": [
        {
          "id": 0,
          "name": "string",
          "url": "string"
        }
      ],
      "logo": {
        "id": 0,
        "modId": 0,
        "title": "string",
        "description": "string",
        "thumbnailUrl": "string",
        "url": "string"
      },
      "screenshots": [
        {
          "id": 0,
          "modId": 0,
          "title": "string",
          "description": "string",
          "thumbnailUrl": "string",
          "url": "string"
        }
      ],
      "mainFileId": 0,
      "latestFiles": [
        {
          "id": 0,
          "gameId": 0,
          "modId": 0,
          "isAvailable": true,
          "displayName": "string",
          "fileName": "string",
          "releaseType": 1,
          "fileStatus": 1,
          "hashes": [
            {
              "value": "string",
              "algo": 1
            }
          ],
          "fileDate": "2019-08-24T14:15:22Z",
          "fileLength": 0,
          "downloadCount": 0,
          "fileSizeOnDisk": 0,
          "downloadUrl": "string",
          "gameVersions": [
            "string"
          ],
          "sortableGameVersions": [
            {
              "gameVersionName": "string",
              "gameVersionPadded": "string",
              "gameVersion": "string",
              "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
              "gameVersionTypeId": 0
            }
          ],
          "dependencies": [
            {
              "modId": 0,
              "relationType": 1
            }
          ],
          "exposeAsAlternative": true,
          "parentProjectFileId": 0,
          "alternateFileId": 0,
          "isServerPack": true,
          "serverPackFileId": 0,
          "isEarlyAccessContent": true,
          "earlyAccessEndDate": "2019-08-24T14:15:22Z",
          "fileFingerprint": 0,
          "modules": [
            {
              "name": "string",
              "fingerprint": 0
            }
          ]
        }
      ],
      "latestFilesIndexes": [
        {
          "gameVersion": "string",
          "fileId": 0,
          "filename": "string",
          "releaseType": 1,
          "gameVersionTypeId": 0,
          "modLoader": 0
        }
      ],
      "latestEarlyAccessFilesIndexes": [
        {
          "gameVersion": "string",
          "fileId": 0,
          "filename": "string",
          "releaseType": 1,
          "gameVersionTypeId": 0,
          "modLoader": 0
        }
      ],
      "dateCreated": "2019-08-24T14:15:22Z",
      "dateModified": "2019-08-24T14:15:22Z",
      "dateReleased": "2019-08-24T14:15:22Z",
      "allowModDistribution": true,
      "gamePopularityRank": 0,
      "isAvailable": true,
      "thumbsUpCount": 0,
      "rating": 0
    }
  ]
}

Properties
Name	Type	Description
data	[Mod]	The response data
Get Version Types Response

{
  "data": [
    {
      "id": 0,
      "gameId": 0,
      "name": "string",
      "slug": "string",
      "isSyncable": true,
      "status": 1
    }
  ]
}

Properties
Name	Type	Description
data	[GameVersionType]	The response data
Get Versions Response - V1

{
  "data": [
    {
      "type": 0,
      "versions": [
        "string"
      ]
    }
  ]
}

Properties
Name	Type	Description
data	[GameVersionsByType]	The response data
Get Versions Response - V2

{
  "data": [
    {
      "type": 0,
      "versions": [
        {
          "id": 0,
          "slug": "string",
          "name": "string"
        }
      ]
    }
  ]
}

Properties
Name	Type	Description
data	[GameVersionsByType2]	The response data
GetFeaturedModsRequestBody

{
  "gameId": 0,
  "excludedModIds": [
    0
  ],
  "gameVersionTypeId": 0
}

Properties
Name	Type	Description
gameId	integer(int32)	none
excludedModIds	[integer]	none
gameVersionTypeId	integer(int32)¦null	none
GetFingerprintMatchesRequestBody

{
  "fingerprints": [
    0
  ]
}

Properties
Name	Type	Description
fingerprints	[integer]	none
GetFuzzyMatchesRequestBody

{
  "gameId": 0,
  "fingerprints": [
    {
      "foldername": "string",
      "fingerprints": [
        0
      ]
    }
  ]
}

Properties
Name	Type	Description
gameId	integer(int32)	none
fingerprints	[FolderFingerprint]	none
GetModFilesRequestBody

{
  "fileIds": [
    0
  ]
}

Properties
Name	Type	Description
fileIds	[integer]	none
GetModsByIdsListRequestBody

{
  "modIds": [
    0
  ],
  "filterPcOnly": true
}

Properties
Name	Type	Description
modIds	[integer]	none
filterPcOnly	boolean¦null	none
HashAlgo

1

Possible enum values:

1=Sha1

2=Md5

MinecraftGameVersion

{
  "id": 0,
  "gameVersionId": 0,
  "versionString": "string",
  "jarDownloadUrl": "string",
  "jsonDownloadUrl": "string",
  "approved": true,
  "dateModified": "2019-08-24T14:15:22Z",
  "gameVersionTypeId": 0,
  "gameVersionStatus": 1,
  "gameVersionTypeStatus": 1
}

Properties
Name	Type	Description
id	integer(int32)	none
gameVersionId	integer(int32)	none
versionString	string	none
jarDownloadUrl	string	none
jsonDownloadUrl	string	none
approved	boolean	none
dateModified	string(date-time)	none
gameVersionTypeId	integer(int32)	none
gameVersionStatus	GameVersionStatus	1 = Approved
2 = Deleted
3 = New
gameVersionTypeStatus	GameVersionTypeStatus	1 = Normal
2 = Deleted
MinecraftModLoaderIndex

{
  "name": "string",
  "gameVersion": "string",
  "latest": true,
  "recommended": true,
  "dateModified": "2019-08-24T14:15:22Z",
  "type": 0
}

Properties
Name	Type	Description
name	string	none
gameVersion	string	none
latest	boolean	none
recommended	boolean	none
dateModified	string(date-time)	none
type	ModLoaderType	0 = Any
1 = Forge
2 = Cauldron
3 = LiteLoader
4 = Fabric
5 = Quilt
6 = NeoForge
MinecraftModLoaderVersion

{
  "id": 0,
  "gameVersionId": 0,
  "minecraftGameVersionId": 0,
  "forgeVersion": "string",
  "name": "string",
  "type": 0,
  "downloadUrl": "string",
  "filename": "string",
  "installMethod": 1,
  "latest": true,
  "recommended": true,
  "approved": true,
  "dateModified": "2019-08-24T14:15:22Z",
  "mavenVersionString": "string",
  "versionJson": "string",
  "librariesInstallLocation": "string",
  "minecraftVersion": "string",
  "additionalFilesJson": "string",
  "modLoaderGameVersionId": 0,
  "modLoaderGameVersionTypeId": 0,
  "modLoaderGameVersionStatus": 1,
  "modLoaderGameVersionTypeStatus": 1,
  "mcGameVersionId": 0,
  "mcGameVersionTypeId": 0,
  "mcGameVersionStatus": 1,
  "mcGameVersionTypeStatus": 1,
  "installProfileJson": "string"
}

Properties
Name	Type	Description
id	integer(int32)	none
gameVersionId	integer(int32)	none
minecraftGameVersionId	integer(int32)	none
forgeVersion	string	none
name	string	none
type	ModLoaderType	0 = Any
1 = Forge
2 = Cauldron
3 = LiteLoader
4 = Fabric
5 = Quilt
6 = NeoForge
downloadUrl	string	none
filename	string	none
installMethod	ModLoaderInstallMethod	1 = ForgeInstaller
2 = ForgeJarInstall
3 = ForgeInstaller_v2
4 = FabricInstaller
5 = QuiltInstaller
6 = NeoForgeInstaller
latest	boolean	none
recommended	boolean	none
approved	boolean	none
dateModified	string(date-time)	none
mavenVersionString	string	none
versionJson	string	none
librariesInstallLocation	string	none
minecraftVersion	string	none
additionalFilesJson	string	none
modLoaderGameVersionId	integer(int32)	none
modLoaderGameVersionTypeId	integer(int32)	none
modLoaderGameVersionStatus	GameVersionStatus	1 = Approved
2 = Deleted
3 = New
modLoaderGameVersionTypeStatus	GameVersionTypeStatus	1 = Normal
2 = Deleted
mcGameVersionId	integer(int32)	none
mcGameVersionTypeId	integer(int32)	none
mcGameVersionStatus	GameVersionStatus	1 = Approved
2 = Deleted
3 = New
mcGameVersionTypeStatus	GameVersionTypeStatus	1 = Normal
2 = Deleted
installProfileJson	string	none
Mod

{
  "id": 0,
  "gameId": 0,
  "name": "string",
  "slug": "string",
  "links": {
    "websiteUrl": "string",
    "wikiUrl": "string",
    "issuesUrl": "string",
    "sourceUrl": "string"
  },
  "summary": "string",
  "status": 1,
  "downloadCount": 0,
  "isFeatured": true,
  "primaryCategoryId": 0,
  "categories": [
    {
      "id": 0,
      "gameId": 0,
      "name": "string",
      "slug": "string",
      "url": "string",
      "iconUrl": "string",
      "dateModified": "2019-08-24T14:15:22Z",
      "isClass": true,
      "classId": 0,
      "parentCategoryId": 0,
      "displayIndex": 0
    }
  ],
  "classId": 0,
  "authors": [
    {
      "id": 0,
      "name": "string",
      "url": "string"
    }
  ],
  "logo": {
    "id": 0,
    "modId": 0,
    "title": "string",
    "description": "string",
    "thumbnailUrl": "string",
    "url": "string"
  },
  "screenshots": [
    {
      "id": 0,
      "modId": 0,
      "title": "string",
      "description": "string",
      "thumbnailUrl": "string",
      "url": "string"
    }
  ],
  "mainFileId": 0,
  "latestFiles": [
    {
      "id": 0,
      "gameId": 0,
      "modId": 0,
      "isAvailable": true,
      "displayName": "string",
      "fileName": "string",
      "releaseType": 1,
      "fileStatus": 1,
      "hashes": [
        {
          "value": "string",
          "algo": 1
        }
      ],
      "fileDate": "2019-08-24T14:15:22Z",
      "fileLength": 0,
      "downloadCount": 0,
      "fileSizeOnDisk": 0,
      "downloadUrl": "string",
      "gameVersions": [
        "string"
      ],
      "sortableGameVersions": [
        {
          "gameVersionName": "string",
          "gameVersionPadded": "string",
          "gameVersion": "string",
          "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
          "gameVersionTypeId": 0
        }
      ],
      "dependencies": [
        {
          "modId": 0,
          "relationType": 1
        }
      ],
      "exposeAsAlternative": true,
      "parentProjectFileId": 0,
      "alternateFileId": 0,
      "isServerPack": true,
      "serverPackFileId": 0,
      "isEarlyAccessContent": true,
      "earlyAccessEndDate": "2019-08-24T14:15:22Z",
      "fileFingerprint": 0,
      "modules": [
        {
          "name": "string",
          "fingerprint": 0
        }
      ]
    }
  ],
  "latestFilesIndexes": [
    {
      "gameVersion": "string",
      "fileId": 0,
      "filename": "string",
      "releaseType": 1,
      "gameVersionTypeId": 0,
      "modLoader": 0
    }
  ],
  "latestEarlyAccessFilesIndexes": [
    {
      "gameVersion": "string",
      "fileId": 0,
      "filename": "string",
      "releaseType": 1,
      "gameVersionTypeId": 0,
      "modLoader": 0
    }
  ],
  "dateCreated": "2019-08-24T14:15:22Z",
  "dateModified": "2019-08-24T14:15:22Z",
  "dateReleased": "2019-08-24T14:15:22Z",
  "allowModDistribution": true,
  "gamePopularityRank": 0,
  "isAvailable": true,
  "thumbsUpCount": 0,
  "rating": 0
}

Properties
Name	Type	Description
id	integer(int32)	The mod id
gameId	integer(int32)	The game id this mod is for
name	string	The name of the mod
slug	string	The mod slug that would appear in the URL
links	ModLinks	Relevant links for the mod such as Issue tracker and Wiki
summary	string	Mod summary
status	ModStatus	Current mod status
downloadCount	integer(int64)	Number of downloads for the mod
isFeatured	boolean	Whether the mod is included in the featured mods list
primaryCategoryId	integer(int32)	The main category of the mod as it was chosen by the mod author
categories	[Category]	List of categories that this mod is related to
classId	integer(int32)¦null	The class id this mod belongs to
authors	[ModAuthor]	List of the mod's authors
logo	ModAsset	The mod's logo asset
screenshots	[ModAsset]	List of screenshots assets
mainFileId	integer(int32)	The id of the main file of the mod
latestFiles	[File]	List of latest files of the mod
latestFilesIndexes	[FileIndex]	List of file related details for the latest files of the mod
latestEarlyAccessFilesIndexes	[FileIndex]	List of file related details for the latest early access files of the mod
dateCreated	string(date-time)	The creation date of the mod
dateModified	string(date-time)	The last time the mod was modified
dateReleased	string(date-time)	The release date of the mod
allowModDistribution	boolean¦null	Is mod allowed to be distributed
gamePopularityRank	integer(int32)	The mod popularity rank for the game
isAvailable	boolean	Is the mod available for search. This can be false when a mod is experimental, in a deleted state or has only alpha files
thumbsUpCount	integer(int32)	The mod's thumbs up count
rating	number(decimal)¦null	The mod's Rating
ModAsset

{
  "id": 0,
  "modId": 0,
  "title": "string",
  "description": "string",
  "thumbnailUrl": "string",
  "url": "string"
}

Properties
Name	Type	Description
id	integer(int32)	none
modId	integer(int32)	none
title	string	none
description	string	none
thumbnailUrl	string	none
url	string	none
ModAuthor

{
  "id": 0,
  "name": "string",
  "url": "string"
}

Properties
Name	Type	Description
id	integer(int32)	none
name	string	none
url	string	none
ModLinks

{
  "websiteUrl": "string",
  "wikiUrl": "string",
  "issuesUrl": "string",
  "sourceUrl": "string"
}

Properties
Name	Type	Description
websiteUrl	string	none
wikiUrl	string	none
issuesUrl	string	none
sourceUrl	string	none
ModLoaderInstallMethod

1

Possible enum values:

1=ForgeInstaller

2=ForgeJarInstall

3=ForgeInstaller_v2

4=FabricInstaller

5=QuiltInstaller

6=NeoForgeInstaller

ModLoaderType

0

Possible enum values:

0=Any

1=Forge

2=Cauldron

3=LiteLoader

4=Fabric

5=Quilt

6=NeoForge

ModsSearchSortField

1

Possible enum values:

1=Featured

2=Popularity

3=LastUpdated

4=Name

5=Author

6=TotalDownloads

7=Category

8=GameVersion

9=EarlyAccess

10=FeaturedReleased

11=ReleasedDate

12=Rating

ModStatus

1

Possible enum values:

1=New

2=ChangesRequired

3=UnderSoftReview

4=Approved

5=Rejected

6=ChangesMade

7=Inactive

8=Abandoned

9=Deleted

10=UnderReview

Pagination

{
  "index": 0,
  "pageSize": 0,
  "resultCount": 0,
  "totalCount": 0
}

Properties
Name	Type	Description
index	integer(int32)	A zero based index of the first item that is included in the response
pageSize	integer(int32)	The requested number of items to be included in the response
resultCount	integer(int32)	The actual number of items that were included in the response
totalCount	integer(int64)	The total number of items available by the request
Search Mods Response

{
  "data": [
    {
      "id": 0,
      "gameId": 0,
      "name": "string",
      "slug": "string",
      "links": {
        "websiteUrl": "string",
        "wikiUrl": "string",
        "issuesUrl": "string",
        "sourceUrl": "string"
      },
      "summary": "string",
      "status": 1,
      "downloadCount": 0,
      "isFeatured": true,
      "primaryCategoryId": 0,
      "categories": [
        {
          "id": 0,
          "gameId": 0,
          "name": "string",
          "slug": "string",
          "url": "string",
          "iconUrl": "string",
          "dateModified": "2019-08-24T14:15:22Z",
          "isClass": true,
          "classId": 0,
          "parentCategoryId": 0,
          "displayIndex": 0
        }
      ],
      "classId": 0,
      "authors": [
        {
          "id": 0,
          "name": "string",
          "url": "string"
        }
      ],
      "logo": {
        "id": 0,
        "modId": 0,
        "title": "string",
        "description": "string",
        "thumbnailUrl": "string",
        "url": "string"
      },
      "screenshots": [
        {
          "id": 0,
          "modId": 0,
          "title": "string",
          "description": "string",
          "thumbnailUrl": "string",
          "url": "string"
        }
      ],
      "mainFileId": 0,
      "latestFiles": [
        {
          "id": 0,
          "gameId": 0,
          "modId": 0,
          "isAvailable": true,
          "displayName": "string",
          "fileName": "string",
          "releaseType": 1,
          "fileStatus": 1,
          "hashes": [
            {
              "value": "string",
              "algo": 1
            }
          ],
          "fileDate": "2019-08-24T14:15:22Z",
          "fileLength": 0,
          "downloadCount": 0,
          "fileSizeOnDisk": 0,
          "downloadUrl": "string",
          "gameVersions": [
            "string"
          ],
          "sortableGameVersions": [
            {
              "gameVersionName": "string",
              "gameVersionPadded": "string",
              "gameVersion": "string",
              "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
              "gameVersionTypeId": 0
            }
          ],
          "dependencies": [
            {
              "modId": 0,
              "relationType": 1
            }
          ],
          "exposeAsAlternative": true,
          "parentProjectFileId": 0,
          "alternateFileId": 0,
          "isServerPack": true,
          "serverPackFileId": 0,
          "isEarlyAccessContent": true,
          "earlyAccessEndDate": "2019-08-24T14:15:22Z",
          "fileFingerprint": 0,
          "modules": [
            {
              "name": "string",
              "fingerprint": 0
            }
          ]
        }
      ],
      "latestFilesIndexes": [
        {
          "gameVersion": "string",
          "fileId": 0,
          "filename": "string",
          "releaseType": 1,
          "gameVersionTypeId": 0,
          "modLoader": 0
        }
      ],
      "latestEarlyAccessFilesIndexes": [
        {
          "gameVersion": "string",
          "fileId": 0,
          "filename": "string",
          "releaseType": 1,
          "gameVersionTypeId": 0,
          "modLoader": 0
        }
      ],
      "dateCreated": "2019-08-24T14:15:22Z",
      "dateModified": "2019-08-24T14:15:22Z",
      "dateReleased": "2019-08-24T14:15:22Z",
      "allowModDistribution": true,
      "gamePopularityRank": 0,
      "isAvailable": true,
      "thumbsUpCount": 0,
      "rating": 0
    }
  ],
  "pagination": {
    "index": 0,
    "pageSize": 0,
    "resultCount": 0,
    "totalCount": 0
  }
}

Properties
Name	Type	Description
data	[Mod]	The response data
pagination	Pagination	The response pagination information
SortableGameVersion

{
  "gameVersionName": "string",
  "gameVersionPadded": "string",
  "gameVersion": "string",
  "gameVersionReleaseDate": "2019-08-24T14:15:22Z",
  "gameVersionTypeId": 0
}

Properties
Name	Type	Description
gameVersionName	string	Original version name (e.g. 1.5b)
gameVersionPadded	string	Used for sorting (e.g. 0000000001.0000000005)
gameVersion	string	game version clean name (e.g. 1.5)
gameVersionReleaseDate	string(date-time)	Game version release date
gameVersionTypeId	integer(int32)¦null	Game version type id
SortOrder

"asc"

String Response

{
  "data": "string"
}

