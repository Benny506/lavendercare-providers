import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { LocateIcon, Trash } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { getServiceStatusColor, getServiceStatusFeedBack } from "@/lib/utilsJsx";
import { formatNumberWithCommas, secondsToLabel } from "@/lib/utils";

import SetServiceHours from "./modals/SetServiceHours";
import HideService from "./HideService";
import ServiceType from "./modals/ServiceType";
import AddServiceModal from "./modals/AddServiceModal";
import ZeroItems from "@/components/ZeroItems";
import useApiReqs from "@/hooks/useApiReqs";
import Card from "@/components/ui/Card";
import ServiceLocation from "./modals/ServiceLocation";

export default function ServiceDetails() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const service_id = state?.service_id;

  const {
    getSingleService,
    editService,
    addServiceType,
    updateServiceType,
    deleteServiceType,
  } = useApiReqs();

  const [service, setService] = useState(null);
  const [editModals, setEditModals] = useState({ type: null, info: null });
  const [locations, setLocations] = useState([])
  const [serviceLocationModal, setServiceLocationModal] = useState({ visible: false, hide: null })

  useEffect(() => {
    if (!service_id) {
      toast.info("Service not found");
      navigate("/services");
      return;
    }

    getSingleService({
      service_id,
      callBack: ({ service }) => setService(service),
    });
  }, [service_id]);

  useEffect(() => {
    setLocations(service?.locations || [])
  }, [service])

  const openServiceLocationModal = () => setServiceLocationModal({ visible: true, hide: hideServiceLocationModal })
  const hideServiceLocationModal = () => setServiceLocationModal({ visible: false, hide: null })

  if (!service) return null;

  const {
    service_name,
    status,
    service_category,
    service_details,
    location,
    country,
    city,
    availability,
    types,
  } = service;

  /* ------------------ Handlers ------------------ */

  const updateAvailability = (availability) => {
    editService({
      service,
      update: { availability },
      callBack: ({ updatedService }) => {
        setService(updatedService);
        setEditModals({ type: null });
      },
    });
  };

  const updateServiceDetails = (payload) => {
    editService({
      service,
      update: payload,
      callBack: ({ updatedService }) => {
        setService(updatedService);
        setEditModals({ type: null });
      },
    });
  };

  /* ------------------ UI ------------------ */

  return (
    <div className="w-full min-h-screen space-y-8">

      {/* PAGE HEADER */}
      <div className="w-full flex flex-col gap-6 mb-8">

        {/* Row 1 — Utility */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/services")}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition"
          >
            <Icon icon="ph:arrow-left" className="text-lg" />
            Back to Services
          </button>

          <Button
            onClick={() => setEditModals({ type: "hide_service" })}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition
        ${status === "hidden"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
              }`}
          >
            {status === "hidden" ? "Show Service" : "Hide Service"}
          </Button>
        </div>

        {/* Row 2 — Identity */}
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">
            {service_name}
          </h1>

          <div className="flex items-center gap-3 flex-wrap">
            <Badge className="capitalize rounded-md px-3 py-1 bg-gray-100 text-gray-700">
              {service_category?.replaceAll("_", " ")}
            </Badge>

            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-md capitalize
          ${status === "approved"
                  ? "bg-green-100 text-green-700"
                  : status === "hidden"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
            >
              {status}
            </span>
          </div>
        </div>

        {/* Row 3 — Status Explanation */}
        <div className="border-l-4 pl-4 py-2 bg-gray-50 rounded-r-md">
          <p className="text-sm text-gray-700 leading-relaxed max-w-3xl">
            {getServiceStatusFeedBack({ status })}
          </p>
        </div>

      </div>


      {/* SESSION TYPES */}
      <section className="bg-white rounded-2xl border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Duration & Fees</h2>
          <Button
            variant="ghost"
            onClick={() => setEditModals({ type: "serviceType" })}
            className="text-primary-600"
          >
            <Icon icon="mdi:plus" className="text-2xl" />
            Add
          </Button>
        </div>

        {types?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {types.map((t) => (
              <div
                key={t.id}
                className="border rounded-xl p-4 hover:shadow transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="text-sm space-y-1 text-gray-700">
                    <p>Duration: {secondsToLabel({ seconds: t.duration })}</p>
                    <p>
                      Price: {t.currency}{" "}
                      {formatNumberWithCommas(t.price)}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {t.is_virtual ? "Virtual" : "Physical"}
                  </Badge>
                </div>

                <div className="flex justify-between mt-4">
                  <Button
                    variant="ghost"
                    onClick={() =>
                      setEditModals({ type: "serviceType", info: t })
                    }
                    className="text-primary-600"
                  >
                    Edit
                  </Button>

                  <Button
                    variant="ghost"
                    className="text-red-500"
                    onClick={() =>
                      deleteServiceType({
                        service,
                        requestInfo: { type_id: t.id },
                        callBack: ({ updatedService }) =>
                          setService(updatedService),
                      })
                    }
                  >
                    <Trash size={18} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ZeroItems
            zeroText1="No session types"
            zeroText2="Add one to get started"
          />
        )}
      </section>

      {/* DETAILS */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">

        {/* Header Row */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Service Details</h2>
          <Button
            variant="ghost"
            onClick={() => setEditModals({ type: "service_details" })}
            className="text-primary-600 font-semibold"
          >
            Edit
          </Button>
        </div>

        {/* Content Grid */}
        <div className="">

          {/* Description */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <h3 className="font-semibold text-gray-800">Description</h3>
            <p className="text-gray-700 text-sm leading-relaxed">{service_details}</p>
          </div>

          {/* Location Info */}
          {/* <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <h3 className="font-semibold text-gray-800">Location</h3>
            <ul className="text-gray-700 text-sm space-y-1">
              <li><span className="font-medium">Country:</span> {country?.replaceAll("_", " ")}</li>
              <li><span className="font-medium">State:</span> {service?.state?.replaceAll("_", " ")}</li>
              <li><span className="font-medium">City:</span> {city?.replaceAll("_", " ")}</li>
              <li><span className="font-medium">Specific Location:</span> {location}</li>
            </ul>
          </div> */}
        </div>
      </section>

      <Card
        title="Location & Fees"
        subtitle="Only set this if this service can be rendered physically!"
        icon={LocateIcon}
      >
        <div className="space-y-4">

          {/* Existing service locations */}
          {locations.length === 0 && (
            <p className="text-sm text-gray-500">
              Not set
            </p>
          )}

          {locations.map((loc, index) => {

            return (
              <div
                key={index}
                className="flex justify-between flex-wrap gap-3 items-center border border-gray-200 rounded-lg p-3"
              >
                <div>
                  <p className="text-sm text-gray-500">
                    {loc.country} · {loc.state} · {loc.city} · {loc?.address}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const canBePhysical = types?.filter(t => !t?.is_virtual)?.[0]

                    const updated = locations.filter((_, i) => i !== index);

                    if(canBePhysical && updated?.length === 0){
                      return toast.info("This service required at least 1 address because it can be rendered physically")
                    }

                    updateServiceDetails({
                      locations: updated?.length === 0 ? null : updated
                    })
                  }}
                  className="text-sm text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            )
          })}

          {/* Add button */}
          <button
            type="button"
            onClick={openServiceLocationModal}
            className="w-full border border-dashed border-primary-400 text-primary-600 py-3 rounded-lg font-semibold hover:bg-primary-50 transition"
          >
            {
              locations?.length === 0 ? 'Click to Set' : 'Click to add more'
            }
          </button>

        </div>
      </Card>

      {/* SERVICE HOURS (UNCHANGED) */}
      <SetServiceHours
        info={{ ...availability }}
        handleContinueBtnClick={updateAvailability}
      />

      {/* MODALS */}
      <HideService
        service={service}
        isOpen={editModals.type === "hide_service"}
        hide={() => setEditModals({ type: null })}
        setService={setService}
      />

      <ServiceType
        info={editModals.info}
        isOpen={editModals.type === "serviceType"}
        hide={() => setEditModals({ type: null })}
        continueBtnText="Save"
        handleContinueBtnClick={({ requestInfo, info }) => {
          if (info?.id) {
            updateServiceType({
              service,
              requestInfo: { update: requestInfo, type_id: info.id },
              callBack: ({ updatedService }) => setService(updatedService),
            });
          } else {
            addServiceType({
              service,
              requestInfo: { ...requestInfo, service_id: service.id },
              callBack: ({ updatedService }) => setService(updatedService),
            });
          }
          setEditModals({ type: null });
        }}
      />

      <AddServiceModal
        info={{
          service_details,
          location,
          service_category,
          service_name,
          country,
          city,
          state: service?.state,
        }}
        isOpen={editModals.type === "service_details"}
        hide={() => setEditModals({ type: null })}
        handleContinueBtnClick={updateServiceDetails}
      />

      <ServiceLocation
        isOpen={serviceLocationModal.visible}
        hide={serviceLocationModal.hide}
        continueBtnText={"Continue"}
        handleContinueBtnClick={({ requestInfo, info }) => {
          hideServiceLocationModal()
          const updatedLocations = [requestInfo, ...locations]

          updateServiceDetails({
            locations: updatedLocations
          })
        }}
      />
    </div>
  );
}
