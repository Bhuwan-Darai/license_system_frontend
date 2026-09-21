"use client";

import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { useI18n } from "@/app/context/LanguageContext";

type VehicleType = {
    id: string; // also the key of the vehicle's name in the dictionaries (pricing.vehicles)
    registrationCharge: number;
};

const VEHICLES: VehicleType[] = [
    { id: "motorcycle", registrationCharge: 0 },
    { id: "three-wheeler", registrationCharge: 0 },
    { id: "car", registrationCharge: 0 },
    { id: "electric-car", registrationCharge: 0 },
    { id: "microbus", registrationCharge: 0 },
    { id: "bus", registrationCharge: 0 },
    { id: "truck", registrationCharge: 0 },
    { id: "tractor", registrationCharge: 0 },
];

const SERVICE_FEE = 199;

export default function VehicleRegistrationPricing() {
    const { m, n } = useI18n();
    const { pricing } = m;
    const money = (amount: number) =>
        `${pricing.currency} ${n(amount.toLocaleString("en-US"))}`;
    const [selectedVehicle, setSelectedVehicle] = useState(VEHICLES[0].id);

    const vehicle = useMemo(
        () => VEHICLES.find((item) => item.id === selectedVehicle) ?? VEHICLES[0],
        [selectedVehicle]
    );

    const total = vehicle.registrationCharge + SERVICE_FEE;

    return (
        <section className="w-full bg-ly-surface py-16 sm:py-20 lg:py-24">
            <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-12">

                {/* Header */}
                <div className="max-w-2xl mb-10 sm:mb-12">
                    <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-ly-ink leading-tight">
                        {pricing.title}
                    </h2>
                    <p className="mt-4 text-ly-muted leading-relaxed">
                        {pricing.subtitle}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-6 lg:gap-8">

                    {/* Vehicle selection */}
                    <div className="bg-ly-card border border-ly-gold/15 rounded-2xl sm:rounded-3xl p-5 sm:p-7">
                        <h3 className="font-serif text-2xl text-ly-ink mb-6">
                            {pricing.selectVehicle}
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {VEHICLES.map((item) => {
                                const active = item.id === selectedVehicle;

                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setSelectedVehicle(item.id)}
                                        className={`
                                            relative text-left rounded-xl border px-4 py-3.5
                                            transition-colors duration-150
                                            ${
                                            active
                                                ? "border-ly-brand-text bg-ly-brand/[0.04]"
                                                : "border-ly-ink/10 hover:border-ly-gold/50"
                                        }
                                        `}
                                    >
                                        <p className="font-medium text-ly-ink pr-6">
                                            {pricing.vehicles[item.id]}
                                        </p>

                                        {active && (
                                            <span className="absolute top-3.5 right-3.5 w-5 h-5 rounded-full bg-ly-brand flex items-center justify-center">
                                                <Check className="w-3 h-3 text-white" />
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Price summary */}
                    <div className="bg-ly-panel rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white flex flex-col">
                        <h3 className="font-serif text-2xl">{pricing.summary}</h3>

                        <div className="mt-8 space-y-5">
                            <div className="flex justify-between gap-4">
                                <div>
                                    <p className="text-sm text-white/90">{pricing.vehicles[vehicle.id]}</p>
                                    <p className="text-xs text-white/45 mt-1">{pricing.registrationCharge}</p>
                                </div>
                                <p className="text-sm whitespace-nowrap">
                                    {money(vehicle.registrationCharge)}
                                </p>
                            </div>

                            <div className="h-px bg-white/10" />

                            <div className="flex justify-between gap-4">
                                <div>
                                    <p className="text-sm text-white/90">{m.common.brand}</p>
                                    <p className="text-xs text-white/45 mt-1">{pricing.serviceFee}</p>
                                </div>
                                <p className="text-sm whitespace-nowrap">{money(SERVICE_FEE)}</p>
                            </div>
                        </div>

                        <div className="mt-auto pt-8">
                            <div className="h-px bg-white/10 mb-5" />

                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-xs text-white/45 uppercase tracking-wider">{pricing.total}</p>
                                    <p className="text-3xl sm:text-4xl font-serif mt-1">
                                        {money(total)}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="w-full mt-6 bg-ly-brand hover:bg-ly-brand-hover text-white py-3.5 rounded-xl font-medium transition-colors"
                            >
                                {pricing.continue}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}