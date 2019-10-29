'use strict';

const { parseSpec } = require('../utils/dependencySpec');
const Dependency = require('./Dependency');
const DuplicateDependency = require('./DuplicateDependency');
const GroupDependency = require('./GroupDependency');
const ProjectDependency = require('./ProjectDependency');
const RealDependency = require('./RealDependency');
const UnmetDependency = require('./UnmetDependency');

class DependencyFactory {
  /**
   * @param {string} name
   * @param {string} versionSpec
   * @param {DependencyType} type
   * @return {RealDependency}
   */
  create(name, versionSpec = undefined, type = 'normal') {
    const dependencySpec = parseSpec(name, versionSpec);
    return new RealDependency(dependencySpec, type);
  }

  /**
   * @param {RealDependency} original
   * @param {RealDependency} duplicate
   * @return {DuplicateDependency}
   */
  createDuplicate(original, duplicate = null) {
    const type = duplicate && duplicate.type;
    return new DuplicateDependency(original.spec, type)
      .setOriginal(original);
  }

  /**
   * Is used when we need to fetch stats of one or many independent packages
   * @param {string[]} dependencies
   * @return {GroupDependency}
   */
  createGroup(dependencies = []) {
    const group = new GroupDependency();

    dependencies.forEach((depSpec) => {
      const dependency = this.create(depSpec);
      dependency.setIncludesDevDependencies(true);
      group.addDependency(dependency);
    });

    return group;
  }

  /**
   * @param {RealDependency} original
   * @return {RealDependency}
   */
  createUnmet(original) {
    return new UnmetDependency(original.spec, original.type)
      .setOriginal(original);
  }

  /**
   * @param {DependencySpecs} specs
   * @return {RealDependency[]}
   */
  createDependenciesFromSpec(specs) {
    const result = [];

    for (const type of Dependency.TYPES) {
      for (const [name, versionSpec] of Object.entries(specs[type])) {
        result.push(this.create(name, versionSpec, type));
      }
    }

    return result;
  }

  createProject(projectPath) {
    const dependencySpec = parseSpec(null, projectPath);
    return new ProjectDependency(dependencySpec);
  }
}

module.exports = DependencyFactory;
