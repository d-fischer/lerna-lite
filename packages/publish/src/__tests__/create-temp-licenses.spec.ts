import fs from 'fs-extra';
import path from 'path';
import { Project } from '@lerna-lite/core';
import { initFixtureFactory } from '@lerna-test/helpers';
const initFixture = initFixtureFactory(__dirname);
import { createTempLicenses } from '../lib/create-temp-licenses';

describe('createTempLicenses', () => {
  it('copies root license into package location', async () => {
    const cwd = await initFixture('licenses');
    const project = new Project(cwd);
    const [pkg] = await project.getPackages();

    await createTempLicenses(project.licensePath, [pkg]);

    const licenseWritten = await fs.pathExists(path.join(pkg.location, 'LICENSE'));
    expect(licenseWritten).toBe(true);
  });

  it('copies root license into package contents', async () => {
    const cwd = await initFixture('licenses');
    const project = new Project(cwd);
    const [pkg] = await project.getPackages();

    // automagical "contents" setter creates absolute path
    pkg.contents = 'dist';

    await createTempLicenses(project.licensePath, [pkg]);

    const licenseWritten = await fs.pathExists(path.join(pkg.contents, 'LICENSE'));
    expect(licenseWritten).toBe(true);
  });

  it('copies root license into package publishConfig.directory', async () => {
    const cwd = await initFixture('licenses');
    const project = new Project(cwd);
    const [pkg] = await project.getPackages();

    // automagical "contents" getter creates absolute path
    await pkg.set('publishConfig', { directory: 'build' }).serialize();

    await createTempLicenses(project.licensePath, [pkg]);

    const licenseWritten = await fs.pathExists(path.join(pkg.contents, 'LICENSE'));
    expect(licenseWritten).toBe(true);
  });

  it('copies root license with extension into package location', async () => {
    const cwd = await initFixture('licenses');
    const project = new Project(cwd);
    const [pkg] = await project.getPackages();

    await fs.move(path.join(cwd, 'LICENSE'), path.join(cwd, 'LICENSE.md'));
    await createTempLicenses(project.licensePath, [pkg]);

    const licenseWritten = await fs.pathExists(path.join(pkg.location, 'LICENSE.md'));
    expect(licenseWritten).toBe(true);
  });

  it('skips copying when root license is missing', async () => {
    const cwd = await initFixture('licenses');
    const project = new Project(cwd);
    const [pkg] = await project.getPackages();

    await createTempLicenses(undefined as any, [pkg]);

    const licenseWritten = await fs.pathExists(path.join(pkg.location, 'LICENSE'));
    expect(licenseWritten).toBe(false);
  });

  it('skips copying when there are no packages to be licensed', async () => {
    const cwd = await initFixture('licenses');
    const project = new Project(cwd);
    const [pkg] = await project.getPackages();

    await createTempLicenses(project.licensePath, []);

    const licenseWritten = await fs.pathExists(path.join(pkg.location, 'LICENSE'));
    expect(licenseWritten).toBe(false);
  });
});
