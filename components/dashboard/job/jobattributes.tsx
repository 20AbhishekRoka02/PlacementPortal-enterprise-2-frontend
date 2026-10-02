"use client";

import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type JobAttribute = {
  pk: number;
  name: string;
  data_type: string;
  required: boolean;
  visible_to_company: boolean;
  filterable: boolean;
  order: number;
};

type JobAttributesProps = {
  attributes: JobAttribute[];

  addAttribute: () => void;

  updateAttribute: (
    pk: number,
    field: keyof JobAttribute,
    value: string | number | boolean
  ) => void;

  removeAttribute: (pk: number) => void;
};

export function JobAttributes({
  attributes,
  addAttribute,
  updateAttribute,
  removeAttribute,
}: JobAttributesProps) {
  return (
    <Card>
      {/* Header */}
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Job Attributes</CardTitle>

          <p className="mt-1 text-sm text-muted-foreground">
            Add additional fields students need to provide when applying.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={addAttribute}
        >
          <Plus className="size-4" />
          Add Attribute
        </Button>
      </CardHeader>

      {/* Content */}
      <CardContent>
        {attributes.length === 0 ? (
          <div className="rounded-md border border-dashed p-14 text-center text-sm text-muted-foreground">
            No attributes added yet.
          </div>
        ) : (
          <div className="space-y-4">
            {attributes.map((attribute) => (
              <div
                key={attribute.pk}
                className="rounded-lg border p-4"
              >
                {/* Main attribute fields */}
                <div className="grid gap-4 md:grid-cols-[1fr_200px_auto]">

                  {/* Attribute Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Attribute Name
                    </label>

                    <Input
                      placeholder="e.g. CGPA"
                      value={attribute.name}
                      onChange={(e) =>
                        updateAttribute(
                          attribute.pk,
                          "name",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  {/* Data Type */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Data Type
                    </label>

                    <Select
                      value={attribute.data_type}
                      onValueChange={(value) =>
                        updateAttribute(
                          attribute.pk,
                          "data_type",
                          value
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="text">
                          Text
                        </SelectItem>

                        <SelectItem value="integer">
                          Integer
                        </SelectItem>

                        <SelectItem value="decimal">
                          Decimal
                        </SelectItem>

                        <SelectItem value="boolean">
                          Boolean
                        </SelectItem>

                        <SelectItem value="enum">
                          Enum
                        </SelectItem>

                        <SelectItem value="date">
                          Date
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Delete */}
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        removeAttribute(attribute.pk)
                      }
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>

                {/* Options */}
                <div className="mt-4 grid gap-4 md:grid-cols-4">

                  {/* Required */}
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={attribute.required}
                      onCheckedChange={(checked) =>
                        updateAttribute(
                          attribute.pk,
                          "required",
                          checked === true
                        )
                      }
                    />

                    <label className="text-sm">
                      Required
                    </label>
                  </div>

                  {/* Visible to Company */}
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={attribute.visible_to_company}
                      onCheckedChange={(checked) =>
                        updateAttribute(
                          attribute.pk,
                          "visible_to_company",
                          checked === true
                        )
                      }
                    />

                    <label className="text-sm">
                      Visible to Company
                    </label>
                  </div>

                  {/* Filterable */}
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={attribute.filterable}
                      onCheckedChange={(checked) =>
                        updateAttribute(
                          attribute.pk,
                          "filterable",
                          checked === true
                        )
                      }
                    />

                    <label className="text-sm">
                      Filterable
                    </label>
                  </div>

                  {/* Order */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm">
                      Order
                    </label>

                    <Input
                      type="number"
                      min={0}
                      value={attribute.order}
                      onChange={(e) =>
                        updateAttribute(
                          attribute.pk,
                          "order",
                          Number(e.target.value)
                        )
                      }
                      className="w-20"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}