const { Client } = require('pg');

// Function to generate WKT polygon string from an array of points
function createPolygonWKT(points) {
  if (points.length < 3) {
    throw new Error("A polygon must have at least 3 points.");
  }

  // Convert each point to "x y" format
  const coordinates = points.map(point => `${point[0]} ${point[1]}`);
  
  // Close the polygon by repeating the first point at the end
  coordinates.push(`${points[0][0]} ${points[0][1]}`);
  
  return `POLYGON((${coordinates.join(', ')}))`;
}

// Example usage in Node.js to insert a polygon with multiple points
async function insertPolygonWithMultiplePoints() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'your_username',
    password: 'your_password',
    database: 'your_database'
  });

  // Define an array of points for the polygon
  const points = [
    [30, 10],
    [40, 40],
    [20, 40],
    [10, 20]
  ];

  // Generate the WKT polygon string
  const polygonWKT = createPolygonWKT(points);

  try {
    await client.connect();

    // Insert the polygon into the database
    const query = `
      INSERT INTO polygons (geom)
      VALUES (ST_GeomFromText($1, 4326)) RETURNING id;
    `;
    const result = await client.query(query, [polygonWKT]);
    console.log('Inserted polygon with ID:', result.rows[0].id);
  } catch (error) {
    console.error('Error inserting polygon:', error);
  } finally {
    await client.end();
  }
}

insertPolygonWithMultiplePoints();
