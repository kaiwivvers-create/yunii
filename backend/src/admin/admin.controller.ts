import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';

// Mock database for universities
let universities = [
  { id: 1, name: 'Stanford University', location: 'California, USA', province: 'California', region: 'North America', description: 'A private research university in Stanford, California.' },
  { id: 2, name: 'Harvard University', location: 'Massachusetts, USA', province: 'Massachusetts', region: 'North America', description: 'A private Ivy League research university in Cambridge, Massachusetts.' },
  { id: 3, name: 'University of Oxford', location: 'Oxford, UK', province: 'England', region: 'Europe', description: 'A collegiate research university in Oxford, England.' },
  { id: 4, name: 'University of Tokyo', location: 'Tokyo, Japan', province: 'Tokyo', region: 'Asia', description: 'A national research university in Tokyo, Japan.' },
];

// Mock database for regions
let regions = ['North America', 'Europe', 'Asia', 'Oceania', 'South America', 'Africa'];

@Controller('api/admin')
export class AdminController {
  // Universities CRUD
  @Get('universities')
  getUniversities() {
    return universities;
  }

  @Post('universities')
  createUniversity(@Body() body: { name: string; location: string; province: string; region: string; description: string }) {
    const newUni = {
      id: Date.now(),
      ...body,
    };
    universities.push(newUni);
    return newUni;
  }

  @Put('universities/:id')
  updateUniversity(@Param('id') id: string, @Body() body: { name?: string; location?: string; province?: string; region?: string; description?: string }) {
    const index = universities.findIndex(u => u.id === parseInt(id));
    if (index === -1) {
      throw new Error('University not found');
    }
    universities[index] = { ...universities[index], ...body };
    return universities[index];
  }

  @Delete('universities/:id')
  deleteUniversity(@Param('id') id: string) {
    const index = universities.findIndex(u => u.id === parseInt(id));
    if (index === -1) {
      throw new Error('University not found');
    }
    const deleted = universities.splice(index, 1);
    return deleted[0];
  }

  // Regions CRUD
  @Get('regions')
  getRegions() {
    return regions;
  }

  @Post('regions')
  createRegion(@Body() body: { name: string }) {
    if (regions.includes(body.name)) {
      throw new Error('Region already exists');
    }
    regions.push(body.name);
    return { name: body.name };
  }

  @Delete('regions/:name')
  deleteRegion(@Param('name') name: string) {
    const index = regions.indexOf(name);
    if (index === -1) {
      throw new Error('Region not found');
    }
    const deleted = regions.splice(index, 1);
    return { name: deleted[0] };
  }
}
