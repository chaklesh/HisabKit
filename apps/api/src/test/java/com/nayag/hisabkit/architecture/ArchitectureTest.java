package com.nayag.hisabkit.architecture;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;
import static com.tngtech.archunit.library.Architectures.layeredArchitecture;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;

@AnalyzeClasses(
    packages = "com.nayag.hisabkit",
    importOptions = {ImportOption.DoNotIncludeTests.class})
public class ArchitectureTest {

  @ArchTest
  static final ArchRule layers_should_be_respected =
      layeredArchitecture()
          .consideringAllDependencies()
          .layer("Controller")
          .definedBy("com.nayag.hisabkit.modules..controller..")
          .layer("Service")
          .definedBy("com.nayag.hisabkit.modules..service..")
          .layer("Repository")
          .definedBy("com.nayag.hisabkit.modules..repository..")
          .whereLayer("Controller")
          .mayNotBeAccessedByAnyLayer()
          .whereLayer("Service")
          .mayOnlyBeAccessedByLayers("Controller", "Service")
          .whereLayer("Repository")
          .mayOnlyBeAccessedByLayers("Service");

  @ArchTest
  static final ArchRule modules_should_stay_separated =
      noClasses()
          .that()
          .resideInAPackage("com.nayag.hisabkit.modules.ledger..")
          .should()
          .dependOnClassesThat()
          .resideInAPackage("com.nayag.hisabkit.modules.tenant..");

  @ArchTest
  static final ArchRule repositories_should_be_in_repository_package =
      classes().that().haveNameMatching(".*Repository").should().resideInAPackage("..repository..");
}
