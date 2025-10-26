export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="card mb-8">
          <h1 className="text-4xl font-bold mb-6">เกี่ยวกับเรา</h1>
          <p className="text-lg text-gray-700 leading-relaxed">
            เราคือแพลตฟอร์มค้นหารูปภาพจากงานอีเว้นท์ด้วยเทคโนโลジี AI 
            ที่ช่วยให้คุณค้นหารูปภาพของตัวเองจากงานต่าง ๆ ได้อย่างง่ายดาย
          </p>
        </div>

        {/* Mission */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-4">พันธกิจของเรา</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            เราเชื่อว่าทุกช่วงเวลาสำคัญในชีวิตควรถูกบันทึกและจดจำ 
            ด้วยเทคโนโลยี Face Recognition ที่ทันสมัย 
            เราช่วยให้คุณค้นหาและเก็บรักษาความทรงจำเหล่านั้นได้อย่างง่ายดาย
          </p>
          <p className="text-gray-700 leading-relaxed">
            ไม่ว่าจะเป็นงานวิ่งมาราธอน งานคอนเสิร์ต งานแต่งงาน หรืองานอีเว้นท์อื่น ๆ 
            เพียงแค่อัพโหลดรูปใบหน้าของคุณ AI ของเราจะช่วยค้นหารูปที่คุณอยู่ให้ทันที
          </p>
        </div>

        {/* How It Works */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-6">วิธีการทำงาน</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-primary-600">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">ช่างภาพอัพโหลดรูป</h3>
                <p className="text-gray-700">
                  ช่างภาพจากงานอีเว้นท์ต่าง ๆ อัพโหลดรูปภาพทั้งหมดเข้าสู่ระบบ
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-primary-600">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">AI ประมวลผลอัตโนมัติ</h3>
                <p className="text-gray-700">
                  ระบบ AI ของเราจะตรวจจับใบหน้าทุกคนในรูปและสร้าง "ลายนิ้วมือดิจิทัล" 
                  ที่ไม่ซ้ำใครสำหรับแต่ละใบหน้า
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-primary-600">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">คุณค้นหารูปของคุณ</h3>
                <p className="text-gray-700">
                  อัพโหลดรูปใบหน้าของคุณ ระบบจะค้นหาและแสดงรูปทั้งหมดที่คุณอยู่ในงานนั้น
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-primary-600">4</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">ซื้อและดาวน์โหลด</h3>
                <p className="text-gray-700">
                  เลือกรูปที่ชอบ ชำระเงิน และดาวน์โหลดไฟล์ความละเอียดสูงได้ทันที
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-6">จุดเด่นของเรา</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <span className="text-2xl">🤖</span>
                เทคโนโลยี AI ทันสมัย
              </h3>
              <p className="text-gray-700">
                ใช้ Face Recognition ที่แม่นยำสูง ค้นหาได้รวดเร็วภายในไม่กี่วินาที
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <span className="text-2xl">🔒</span>
                ปลอดภัยและเป็นส่วนตัว
              </h3>
              <p className="text-gray-700">
                ข้อมูลของคุณถูกเข้ารหัสและเก็บอย่างปลอดภัย เราไม่แชร์ข้อมูลกับบุคคลที่สาม
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                รวดเร็วและง่ายดาย
              </h3>
              <p className="text-gray-700">
                ใช้งานง่าย ไม่ต้องลงทะเบียน แค่อัพโหลดรูปก็ค้นหาได้ทันที
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <span className="text-2xl">💎</span>
                คุณภาพสูง
              </h3>
              <p className="text-gray-700">
                รูปภาพความละเอียดสูง ไฟล์ไม่มี Watermark เมื่อซื้อแล้ว
              </p>
            </div>
          </div>
        </div>

        {/* Technology */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">เทคโนโลยีที่ใช้</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            เราใช้เทคโนโลยี Deep Learning และ Computer Vision ที่ทันสมัยที่สุด:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Face Detection - ตรวจจับใบหน้าด้วย MTCNN</li>
            <li>Face Recognition - จดจำใบหน้าด้วย FaceNet</li>
            <li>Vector Search - ค้นหาความคล้ายคลึงด้วย Cosine Similarity</li>
            <li>Cloud Infrastructure - ระบบรองรับผู้ใช้จำนวนมากพร้อมกัน</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
