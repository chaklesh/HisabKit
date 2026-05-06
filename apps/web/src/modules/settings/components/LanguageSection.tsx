/**
 * Language settings component
 * Manages language preference (en/hi)
 */

import { cn } from "@hisabkit/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@hisabkit/ui/components/Card";
import { Check, Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const languageChoices = ["en", "hi"] as const;

export function LanguageSection() {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.resolvedLanguage === "hi" ? "hi" : "en";

  const handleLanguageChange = async (nextLanguage: (typeof languageChoices)[number]) => {
    await i18n.changeLanguage(nextLanguage);
    toast.success(t("settings.toast.language_updated", "Language updated"), {
      description: t(`settings.language.${nextLanguage}.description`),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.language.title", "Language preference")}</CardTitle>
        <CardDescription>
          {t(
            "settings.language.description",
            "Choose the working language for operators. This will later align with mobile and printable communication flows.",
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-3 md:grid-cols-2">
          {languageChoices.map((language) => {
            const isActive = currentLanguage === language;
            return (
              <button
                key={language}
                type="button"
                onClick={() => void handleLanguageChange(language)}
                className={cn(
                  "flex flex-col gap-4 rounded-xl border p-4 text-left transition hover:bg-muted",
                  isActive ? "border-primary bg-primary/5 ring-2 ring-primary/15" : "border-border",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="rounded-lg bg-muted p-2">
                    <Languages className="size-4" />
                  </div>
                  {isActive ? <Check className="size-4 text-primary" /> : null}
                </div>
                <div className="space-y-1">
                  <p className="font-medium">{t(`settings.language.${language}.label`)}</p>
                  <p className="text-sm text-muted-foreground">
                    {t(`settings.language.${language}.description`)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
