import PropertyModal from '@/components/PropertyModal'

export default function ModalLoading() {
  return (
    <PropertyModal>
      <div className="animate-pulse">
        <div className="w-full h-[40vh] bg-gray-200" />
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex gap-10">
            <div className="flex-1 space-y-6">
              <div className="bg-white rounded-2xl p-6 space-y-4">
                <div className="h-8 w-3/4 bg-gray-200 rounded" />
                <div className="h-4 w-1/2 bg-gray-200 rounded" />
                <div className="h-10 w-1/3 bg-gray-200 rounded" />
              </div>
              <div className="bg-white rounded-2xl p-6 h-32" />
              <div className="bg-white rounded-2xl p-6 h-64" />
            </div>
            <div className="hidden md:block w-[380px] shrink-0">
              <div className="bg-white rounded-2xl p-6 space-y-3">
                <div className="h-12 bg-gray-200 rounded-xl" />
                <div className="h-12 bg-gray-200 rounded-xl" />
                <div className="h-16 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </PropertyModal>
  )
}
