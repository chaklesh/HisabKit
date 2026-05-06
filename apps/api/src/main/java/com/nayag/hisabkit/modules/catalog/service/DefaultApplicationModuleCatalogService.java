package com.nayag.hisabkit.modules.catalog.service;

import com.nayag.hisabkit.modules.catalog.model.ApplicationModuleDescriptor;
import com.nayag.hisabkit.modules.catalog.model.ApplicationModuleKey;
import com.nayag.hisabkit.modules.catalog.model.ApplicationModuleStatus;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class DefaultApplicationModuleCatalogService implements ApplicationModuleCatalogService {

  private static final List<ApplicationModuleDescriptor> MODULES =
      List.of(
          new ApplicationModuleDescriptor(
              ApplicationModuleKey.DASHBOARD,
              "Dashboard",
              "/dashboard",
              ApplicationModuleStatus.LIVE,
              true,
              "Workspace overview and quick actions"),
          new ApplicationModuleDescriptor(
              ApplicationModuleKey.LEDGER,
              "Customer Ledger",
              "/ledger",
              ApplicationModuleStatus.LIVE,
              true,
              "Customer balances, transactions, and reminders"),
          new ApplicationModuleDescriptor(
              ApplicationModuleKey.INVENTORY,
              "Inventory",
              "/inventory",
              ApplicationModuleStatus.PLANNED,
              false,
              "Stock, item movement, and low-stock workflows"),
          new ApplicationModuleDescriptor(
              ApplicationModuleKey.SUPPLIERS,
              "Suppliers",
              "/suppliers",
              ApplicationModuleStatus.PLANNED,
              false,
              "Vendor balances, purchases, and payment cycles"),
          new ApplicationModuleDescriptor(
              ApplicationModuleKey.LENDING,
              "Money Lending",
              "/lending",
              ApplicationModuleStatus.PLANNED,
              false,
              "EMI, interest, schedules, and overdue tracking"));

  @Override
  public List<ApplicationModuleDescriptor> listModules() {
    return MODULES;
  }
}
