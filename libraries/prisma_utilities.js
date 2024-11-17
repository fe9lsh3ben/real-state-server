
const {
    PrismaClient,
    Prisma,
    User_Type,
    Office_Or_User_Status,
    Real_Estate_Unit_Type,
    Committed_By } = require('@prisma/client');




const prisma = new PrismaClient();
//___________________________Extends___________________________

prisma.$extends({
    model: {
        RealEstateUnit: {
            async create_WKT_Polygon(coordinates) {


                if (!coordinates) {
                    throw new Error('provide coordinates!');
                }

                if (!Array.isArray(coordinates) && coordinates.length < 3) {
                    throw new Error('Invalid coordinates!');
                }

                if (!coordinates.every(points => Array.isArray(points))) {
                    throw new Error('coordinates list should consist a list of points!');
                }

                if (
                    coordinates[0][0] !== coordinates[coordinates.length - 1][0] &&
                    coordinates[0][1] !== coordinates[coordinates.length - 1][1]
                ) {
                    throw new Error('The polygon is not closed. The first point must equal the last point!');
                }


                const polygonString = `POLYGON((${coordinates.map(([lon, lat]) => {
                    if (typeof lon !== 'number' && typeof lat !== 'number' && !isFinite(lon) && !isFinite(lat)) {
                        throw new Error('Invalid coordinate values!');
                    }
                    return `${lon} ${lat}`;
                }).join(', ')}))`;

                return polygonString;
            },

            async updatePolygon(id, coordinates) {

                if (typeof id !== 'number' && !id) {
                    throw new Error('Please provide a valid ID to update!');
                }

                const unit = await prisma.realEstateUnit.findUnique({
                    where: { REU_ID: id },
                    select: {
                        REU_ID: true,
                    }
                });

                if (!unit) {
                    throw new Error('Please provide a valid ID!');
                }

                if (!coordinates) {
                    throw new Error('provide coordinates!');
                }

                if (!Array.isArray(coordinates) && coordinates.length < 3) {
                    throw new Error('Invalid coordinates!');
                }

                if (!coordinates.every(points => Array.isArray(points))) {
                    throw new Error('coordinates list should consist a list of points!');
                }

                if (
                    coordinates[0][0] !== coordinates[coordinates.length - 1][0] &&
                    coordinates[0][1] !== coordinates[coordinates.length - 1][1]
                ) {
                    throw new Error('The polygon is not closed. The first point must equal the last point!');
                }


                const polygonString = `POLYGON((${coordinates.map(([lon, lat]) => {
                    if (typeof lon !== 'number' && typeof lat !== 'number' && !isFinite(lon) && !isFinite(lat)) {
                        throw new Error('Invalid coordinate values!');
                    }
                    return `${lon} ${lat}`;
                }).join(', ')}))`;

                const updateData = {
                    Polygon: Prisma.sql`ST_GeomFromText(${polygonString}, 4326)`
                };


                const updatedUnit = await prisma.realEstateUnit.update({
                    where: { REU_ID: id },
                    data: updateData,
                    select: {
                        REU_ID: true,
                        Polygon: true
                    }
                });

                return updatedUnit;
            },
        },
    },
});


module.exports = {
    prisma,
    Prisma,
    User_Type,
    Office_Or_User_Status,
    Real_Estate_Unit_Type,
    Committed_By
}