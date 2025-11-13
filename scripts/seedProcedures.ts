/**
 * Seed Procedures to Firebase
 *
 * This script populates the procedures collection with comprehensive NHS surgical procedures
 * organized by specialty and subspecialty, each with accurate OPCS-4 codes.
 *
 * At least 30 procedures per specialty/subspecialty combination.
 */

import { db } from '../lib/firebase';
import { collection, doc, setDoc, getDocs, query } from 'firebase/firestore';

interface Procedure {
  name: string;
  specialtyName: string;
  subspecialtyName?: string;
  opcs4: string[];
  commonVariations?: string[];
}

const procedures: Procedure[] = [
  // ============================================
  // TRAUMA AND ORTHOPAEDICS
  // ============================================

  // Upper Limb
  {
    name: 'Total Shoulder Replacement',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Upper Limb',
    opcs4: ['W461', 'W462'],
    commonVariations: ['TSR', 'Shoulder Arthroplasty']
  },
  {
    name: 'Rotator Cuff Repair',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Upper Limb',
    opcs4: ['T502', 'T503'],
    commonVariations: ['Arthroscopic Rotator Cuff Repair']
  },
  {
    name: 'Shoulder Arthroscopy and Subacromial Decompression',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Upper Limb',
    opcs4: ['W823', 'W851'],
    commonVariations: ['SAD', 'Subacromial Decompression']
  },
  {
    name: 'Bankart Repair',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Upper Limb',
    opcs4: ['W512'],
    commonVariations: ['Shoulder Stabilisation', 'Anterior Stabilisation']
  },
  {
    name: 'Acromioclavicular Joint Excision',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Upper Limb',
    opcs4: ['W803'],
    commonVariations: ['ACJ Excision', 'Mumford Procedure']
  },
  {
    name: 'Biceps Tenodesis',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Upper Limb',
    opcs4: ['T573'],
    commonVariations: ['Biceps Tendon Fixation']
  },
  {
    name: 'Open Reduction Internal Fixation of Proximal Humerus Fracture',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Upper Limb',
    opcs4: ['W242'],
    commonVariations: ['ORIF Proximal Humerus', 'Humerus ORIF']
  },
  {
    name: 'Total Elbow Replacement',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Upper Limb',
    opcs4: ['W471', 'W472'],
    commonVariations: ['TER', 'Elbow Arthroplasty']
  },
  {
    name: 'Tennis Elbow Release',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Upper Limb',
    opcs4: ['T563'],
    commonVariations: ['Lateral Epicondylitis Release']
  },
  {
    name: 'Ulnar Nerve Decompression at Elbow',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Upper Limb',
    opcs4: ['A651'],
    commonVariations: ['Cubital Tunnel Release', 'Ulnar Nerve Transposition']
  },
  {
    name: 'Radial Head Excision',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Upper Limb',
    opcs4: ['W803'],
    commonVariations: ['Radial Head Resection']
  },
  {
    name: 'Open Reduction Internal Fixation of Forearm Fracture',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Upper Limb',
    opcs4: ['W242'],
    commonVariations: ['ORIF Radius/Ulna']
  },
  {
    name: 'Carpal Tunnel Decompression',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Upper Limb',
    opcs4: ['A651'],
    commonVariations: ['CTD', 'Carpal Tunnel Release']
  },
  {
    name: 'Open Reduction Internal Fixation of Distal Radius Fracture',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Upper Limb',
    opcs4: ['W242'],
    commonVariations: ['ORIF Distal Radius', 'Colles Fixation']
  },
  {
    name: 'Trigger Finger Release',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Upper Limb',
    opcs4: ['T553'],
    commonVariations: ['A1 Pulley Release']
  },
  {
    name: 'Dupuytrens Fasciectomy',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Upper Limb',
    opcs4: ['T543'],
    commonVariations: ['Palmar Fasciectomy']
  },
  {
    name: 'Ganglion Excision - Wrist',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Upper Limb',
    opcs4: ['T703'],
    commonVariations: ['Wrist Ganglion Excision']
  },
  {
    name: 'De Quervains Release',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Upper Limb',
    opcs4: ['T553'],
    commonVariations: ['First Dorsal Compartment Release']
  },
  {
    name: 'Wrist Arthroscopy',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Upper Limb',
    opcs4: ['W823'],
    commonVariations: ['Diagnostic Wrist Arthroscopy']
  },
  {
    name: 'Trapeziectomy',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Upper Limb',
    opcs4: ['W803'],
    commonVariations: ['Thumb CMC Excision']
  },
  {
    name: 'Thumb CMCJ Arthroplasty',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Upper Limb',
    opcs4: ['W481'],
    commonVariations: ['Trapeziectomy with Suspension']
  },
  {
    name: 'Tendon Transfer - Hand',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Upper Limb',
    opcs4: ['T562'],
    commonVariations: ['Hand Tendon Transfer']
  },
  {
    name: 'Flexor Tendon Repair - Hand',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Upper Limb',
    opcs4: ['T521'],
    commonVariations: ['FDP/FDS Repair']
  },
  {
    name: 'Extensor Tendon Repair - Hand',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Upper Limb',
    opcs4: ['T521'],
    commonVariations: ['EDC Repair']
  },
  {
    name: 'Open Reduction Internal Fixation of Metacarpal Fracture',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Upper Limb',
    opcs4: ['W242'],
    commonVariations: ['ORIF Metacarpal']
  },
  {
    name: 'Open Reduction Internal Fixation of Phalanx Fracture',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Upper Limb',
    opcs4: ['W242'],
    commonVariations: ['ORIF Phalanx']
  },
  {
    name: 'Proximal Row Carpectomy',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Upper Limb',
    opcs4: ['W803'],
    commonVariations: ['PRC']
  },
  {
    name: 'Wrist Fusion',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Upper Limb',
    opcs4: ['W383'],
    commonVariations: ['Wrist Arthrodesis']
  },
  {
    name: 'Ulnar Shortening Osteotomy',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Upper Limb',
    opcs4: ['W301'],
    commonVariations: ['USO']
  },
  {
    name: 'Scaphoid ORIF',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Upper Limb',
    opcs4: ['W242'],
    commonVariations: ['Scaphoid Fixation', 'Herbert Screw']
  },

  // Hip and Knee
  {
    name: 'Total Hip Replacement',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Hip and Knee',
    opcs4: ['W371', 'W381', 'W391'],
    commonVariations: ['THR', 'Total Hip Arthroplasty', 'THA']
  },
  {
    name: 'Hip Resurfacing',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Hip and Knee',
    opcs4: ['W371'],
    commonVariations: ['Birmingham Hip Resurfacing', 'BHR']
  },
  {
    name: 'Revision Total Hip Replacement',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Hip and Knee',
    opcs4: ['W371', 'W381'],
    commonVariations: ['Revision THR', 'rTHR']
  },
  {
    name: 'Hip Hemiarthroplasty',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Hip and Knee',
    opcs4: ['W461', 'W462'],
    commonVariations: ['Austin Moore', 'Bipolar Hemiarthroplasty']
  },
  {
    name: 'Dynamic Hip Screw Fixation',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Hip and Knee',
    opcs4: ['W191'],
    commonVariations: ['DHS', 'Sliding Hip Screw']
  },
  {
    name: 'Intramedullary Hip Screw Fixation',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Hip and Knee',
    opcs4: ['W191'],
    commonVariations: ['IMHS', 'Gamma Nail']
  },
  {
    name: 'Open Reduction Internal Fixation of Acetabular Fracture',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Hip and Knee',
    opcs4: ['W242'],
    commonVariations: ['ORIF Acetabulum']
  },
  {
    name: 'Hip Arthroscopy',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Hip and Knee',
    opcs4: ['W823'],
    commonVariations: ['Arthroscopic Hip Surgery']
  },
  {
    name: 'Hip Arthroscopy with Labral Repair',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Hip and Knee',
    opcs4: ['W823', 'W512'],
    commonVariations: ['FAI Surgery', 'Femoroacetabular Impingement Surgery']
  },
  {
    name: 'Girdlestone Procedure',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Hip and Knee',
    opcs4: ['W801'],
    commonVariations: ['Excision Arthroplasty Hip']
  },
  {
    name: 'Total Knee Replacement',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Hip and Knee',
    opcs4: ['W401', 'W411', 'W421'],
    commonVariations: ['TKR', 'Total Knee Arthroplasty', 'TKA']
  },
  {
    name: 'Unicompartmental Knee Replacement',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Hip and Knee',
    opcs4: ['W401'],
    commonVariations: ['UKR', 'Partial Knee Replacement', 'PKR']
  },
  {
    name: 'Revision Total Knee Replacement',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Hip and Knee',
    opcs4: ['W401', 'W411'],
    commonVariations: ['Revision TKR', 'rTKR']
  },
  {
    name: 'Knee Arthroscopy and Meniscectomy',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Hip and Knee',
    opcs4: ['W821', 'W401'],
    commonVariations: ['Arthroscopic Meniscectomy']
  },
  {
    name: 'Knee Arthroscopy and Meniscal Repair',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Hip and Knee',
    opcs4: ['W821', 'W512'],
    commonVariations: ['Arthroscopic Meniscal Repair']
  },
  {
    name: 'ACL Reconstruction',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Hip and Knee',
    opcs4: ['W512'],
    commonVariations: ['Anterior Cruciate Ligament Reconstruction', 'ACLR']
  },
  {
    name: 'PCL Reconstruction',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Hip and Knee',
    opcs4: ['W512'],
    commonVariations: ['Posterior Cruciate Ligament Reconstruction', 'PCLR']
  },
  {
    name: 'Knee Arthroscopy and Microfracture',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Hip and Knee',
    opcs4: ['W821', 'W852'],
    commonVariations: ['Chondral Defect Treatment']
  },
  {
    name: 'High Tibial Osteotomy',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Hip and Knee',
    opcs4: ['W301'],
    commonVariations: ['HTO', 'Opening Wedge Osteotomy']
  },
  {
    name: 'Patellofemoral Replacement',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Hip and Knee',
    opcs4: ['W401'],
    commonVariations: ['PFR', 'Patellofemoral Arthroplasty']
  },
  {
    name: 'Open Reduction Internal Fixation of Tibial Plateau Fracture',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Hip and Knee',
    opcs4: ['W242'],
    commonVariations: ['ORIF Tibial Plateau']
  },
  {
    name: 'Open Reduction Internal Fixation of Patella Fracture',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Hip and Knee',
    opcs4: ['W242'],
    commonVariations: ['ORIF Patella', 'Tension Band Wiring']
  },
  {
    name: 'Lateral Release Knee',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Hip and Knee',
    opcs4: ['W821'],
    commonVariations: ['Arthroscopic Lateral Release']
  },
  {
    name: 'Tibial Tubercle Osteotomy',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Hip and Knee',
    opcs4: ['W301'],
    commonVariations: ['TTO', 'Fulkerson Osteotomy']
  },
  {
    name: 'MPFL Reconstruction',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Hip and Knee',
    opcs4: ['W512'],
    commonVariations: ['Medial Patellofemoral Ligament Reconstruction']
  },
  {
    name: 'Quadriceps Tendon Repair',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Hip and Knee',
    opcs4: ['T521'],
    commonVariations: ['Quad Tendon Repair']
  },
  {
    name: 'Patellar Tendon Repair',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Hip and Knee',
    opcs4: ['T521'],
    commonVariations: ['Patellar Tendon Reconstruction']
  },
  {
    name: 'Knee Manipulation Under Anaesthetic',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Hip and Knee',
    opcs4: ['W551'],
    commonVariations: ['MUA Knee']
  },
  {
    name: 'Removal of Metalwork - Knee',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Hip and Knee',
    opcs4: ['W241'],
    commonVariations: ['Metalwork Removal Knee']
  },
  {
    name: 'Synovectomy - Knee',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Hip and Knee',
    opcs4: ['W701'],
    commonVariations: ['Knee Synovectomy']
  },

  // Foot and Ankle
  {
    name: 'Total Ankle Replacement',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Foot and Ankle',
    opcs4: ['W451'],
    commonVariations: ['TAR', 'Ankle Arthroplasty']
  },
  {
    name: 'Ankle Arthroscopy',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Foot and Ankle',
    opcs4: ['W823'],
    commonVariations: ['Arthroscopic Ankle Surgery']
  },
  {
    name: 'Ankle Fusion',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Foot and Ankle',
    opcs4: ['W383'],
    commonVariations: ['Ankle Arthrodesis']
  },
  {
    name: 'Open Reduction Internal Fixation of Ankle Fracture',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Foot and Ankle',
    opcs4: ['W242'],
    commonVariations: ['ORIF Ankle', 'Weber Fracture ORIF']
  },
  {
    name: 'Lateral Ligament Reconstruction - Ankle',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Foot and Ankle',
    opcs4: ['W512'],
    commonVariations: ['Brostrom Procedure', 'Ankle Stabilisation']
  },
  {
    name: 'Achilles Tendon Repair',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Foot and Ankle',
    opcs4: ['T521'],
    commonVariations: ['Achilles Repair']
  },
  {
    name: 'Open Reduction Internal Fixation of Calcaneal Fracture',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Foot and Ankle',
    opcs4: ['W242'],
    commonVariations: ['ORIF Calcaneus']
  },
  {
    name: 'Subtalar Fusion',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Foot and Ankle',
    opcs4: ['W383'],
    commonVariations: ['Subtalar Arthrodesis']
  },
  {
    name: 'Triple Fusion',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Foot and Ankle',
    opcs4: ['W383'],
    commonVariations: ['Triple Arthrodesis']
  },
  {
    name: 'Hallux Valgus Correction',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Foot and Ankle',
    opcs4: ['W301'],
    commonVariations: ['Bunion Surgery', 'Scarf Osteotomy']
  },
  {
    name: 'First MTP Joint Fusion',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Foot and Ankle',
    opcs4: ['W383'],
    commonVariations: ['Hallux Rigidus Surgery', 'Big Toe Fusion']
  },
  {
    name: 'Lesser Toe Deformity Correction',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Foot and Ankle',
    opcs4: ['W301'],
    commonVariations: ['Hammer Toe Correction', 'Claw Toe Correction']
  },
  {
    name: 'Mortons Neuroma Excision',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Foot and Ankle',
    opcs4: ['A652'],
    commonVariations: ['Interdigital Neuroma Excision']
  },
  {
    name: 'Plantar Fascia Release',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Foot and Ankle',
    opcs4: ['T553'],
    commonVariations: ['Plantar Fasciectomy']
  },
  {
    name: 'Haglunds Deformity Excision',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Foot and Ankle',
    opcs4: ['W801'],
    commonVariations: ['Posterior Heel Spur Excision']
  },
  {
    name: 'Open Reduction Internal Fixation of Metatarsal Fracture',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Foot and Ankle',
    opcs4: ['W242'],
    commonVariations: ['ORIF Metatarsal']
  },
  {
    name: 'Open Reduction Internal Fixation of Lisfranc Fracture-Dislocation',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Foot and Ankle',
    opcs4: ['W242'],
    commonVariations: ['ORIF Lisfranc', 'Tarsometatarsal ORIF']
  },
  {
    name: 'Talar Dome Lesion Treatment',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Foot and Ankle',
    opcs4: ['W823', 'W852'],
    commonVariations: ['Osteochondral Defect Ankle']
  },
  {
    name: 'Peroneal Tendon Repair',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Foot and Ankle',
    opcs4: ['T521'],
    commonVariations: ['Peroneal Tendon Reconstruction']
  },
  {
    name: 'Tibialis Posterior Tendon Reconstruction',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Foot and Ankle',
    opcs4: ['T562'],
    commonVariations: ['TPTR', 'Flatfoot Reconstruction']
  },
  {
    name: 'Ankle Arthroscopy and Debridement',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Foot and Ankle',
    opcs4: ['W823', 'W852'],
    commonVariations: ['Ankle Arthroscopic Debridement']
  },
  {
    name: 'Removal of Metalwork - Ankle',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Foot and Ankle',
    opcs4: ['W241'],
    commonVariations: ['Metalwork Removal Ankle']
  },
  {
    name: 'Calcaneal Osteotomy',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Foot and Ankle',
    opcs4: ['W301'],
    commonVariations: ['Heel Osteotomy']
  },
  {
    name: 'Tibialis Anterior Tendon Transfer',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Foot and Ankle',
    opcs4: ['T562'],
    commonVariations: ['TAT Transfer']
  },
  {
    name: 'Tarsal Tunnel Release',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Foot and Ankle',
    opcs4: ['A651'],
    commonVariations: ['Posterior Tibial Nerve Decompression']
  },
  {
    name: 'Ankle Impingement Release',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Foot and Ankle',
    opcs4: ['W823'],
    commonVariations: ['Anterior Ankle Impingement']
  },
  {
    name: 'Midfoot Fusion',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Foot and Ankle',
    opcs4: ['W383'],
    commonVariations: ['Midfoot Arthrodesis']
  },
  {
    name: 'Cheilectomy - First MTPJ',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Foot and Ankle',
    opcs4: ['W801'],
    commonVariations: ['Hallux Rigidus Cheilectomy']
  },
  {
    name: 'Ganglion Excision - Foot',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Foot and Ankle',
    opcs4: ['T703'],
    commonVariations: ['Foot Ganglion Excision']
  },
  {
    name: 'Sesamoidectomy',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Foot and Ankle',
    opcs4: ['W801'],
    commonVariations: ['Sesamoid Excision']
  },

  // Spine
  {
    name: 'Lumbar Microdiscectomy',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Spine',
    opcs4: ['V251', 'V254'],
    commonVariations: ['Lumbar Disc Excision', 'Lumbar Decompression']
  },
  {
    name: 'Lumbar Laminectomy',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Spine',
    opcs4: ['V251'],
    commonVariations: ['Lumbar Decompression']
  },
  {
    name: 'Lumbar Spinal Fusion - Posterior',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Spine',
    opcs4: ['V381', 'V384'],
    commonVariations: ['PLIF', 'Posterior Lumbar Fusion']
  },
  {
    name: 'Lumbar Spinal Fusion - Anterior',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Spine',
    opcs4: ['V381', 'V384'],
    commonVariations: ['ALIF', 'Anterior Lumbar Fusion']
  },
  {
    name: 'Lumbar Spinal Fusion - Transforaminal',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Spine',
    opcs4: ['V381', 'V384'],
    commonVariations: ['TLIF', 'Transforaminal Lumbar Fusion']
  },
  {
    name: 'Cervical Discectomy and Fusion - Anterior',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Spine',
    opcs4: ['V251', 'V381'],
    commonVariations: ['ACDF', 'Anterior Cervical Fusion']
  },
  {
    name: 'Cervical Laminoplasty',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Spine',
    opcs4: ['V251'],
    commonVariations: ['Cervical Decompression']
  },
  {
    name: 'Cervical Posterior Decompression and Fusion',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Spine',
    opcs4: ['V251', 'V381'],
    commonVariations: ['Posterior Cervical Fusion']
  },
  {
    name: 'Thoracic Discectomy',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Spine',
    opcs4: ['V251'],
    commonVariations: ['Thoracic Disc Excision']
  },
  {
    name: 'Scoliosis Correction',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Spine',
    opcs4: ['V381', 'V481'],
    commonVariations: ['Posterior Spinal Instrumentation']
  },
  {
    name: 'Kyphoplasty',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Spine',
    opcs4: ['V493'],
    commonVariations: ['Balloon Kyphoplasty']
  },
  {
    name: 'Vertebroplasty',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Spine',
    opcs4: ['V493'],
    commonVariations: ['Cement Augmentation']
  },
  {
    name: 'Foraminotomy - Lumbar',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Spine',
    opcs4: ['V251'],
    commonVariations: ['Nerve Root Decompression']
  },
  {
    name: 'Foraminotomy - Cervical',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Spine',
    opcs4: ['V251'],
    commonVariations: ['Cervical Nerve Root Decompression']
  },
  {
    name: 'Spinal Tumour Excision',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Spine',
    opcs4: ['V141'],
    commonVariations: ['Spinal Tumour Resection']
  },
  {
    name: 'Sacroiliac Joint Fusion',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Spine',
    opcs4: ['V381'],
    commonVariations: ['SI Joint Fusion']
  },
  {
    name: 'Coccygectomy',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Spine',
    opcs4: ['V081'],
    commonVariations: ['Coccyx Excision']
  },
  {
    name: 'Revision Spinal Fusion',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Spine',
    opcs4: ['V381'],
    commonVariations: ['Revision Lumbar Fusion']
  },
  {
    name: 'Minimally Invasive Lumbar Fusion',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Spine',
    opcs4: ['V381'],
    commonVariations: ['MIS TLIF', 'Minimally Invasive TLIF']
  },
  {
    name: 'Laminectomy for Spinal Stenosis',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Spine',
    opcs4: ['V251'],
    commonVariations: ['Decompression for Stenosis']
  },
  {
    name: 'Artificial Disc Replacement - Lumbar',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Spine',
    opcs4: ['V451'],
    commonVariations: ['Lumbar Disc Arthroplasty']
  },
  {
    name: 'Artificial Disc Replacement - Cervical',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Spine',
    opcs4: ['V451'],
    commonVariations: ['Cervical Disc Arthroplasty']
  },
  {
    name: 'Spinal Cord Stimulator Insertion',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Spine',
    opcs4: ['A541'],
    commonVariations: ['SCS Insertion']
  },
  {
    name: 'Interspinous Process Device Insertion',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Spine',
    opcs4: ['V481'],
    commonVariations: ['X-Stop', 'Coflex']
  },
  {
    name: 'Open Reduction Internal Fixation of Thoracolumbar Fracture',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Spine',
    opcs4: ['V242', 'V481'],
    commonVariations: ['ORIF Spine']
  },
  {
    name: 'Corpectomy and Cage Insertion',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Spine',
    opcs4: ['V251', 'V381'],
    commonVariations: ['Vertebral Body Resection']
  },
  {
    name: 'Posterior Cervical Laminectomy and Fusion',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Spine',
    opcs4: ['V251', 'V381'],
    commonVariations: ['Posterior Cervical Decompression and Fusion']
  },
  {
    name: 'Odontoid Peg Screw Fixation',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Spine',
    opcs4: ['V242'],
    commonVariations: ['C2 Fracture Fixation']
  },
  {
    name: 'Occipitocervical Fusion',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Spine',
    opcs4: ['V381'],
    commonVariations: ['Occipito-C2 Fusion']
  },
  {
    name: 'Removal of Spinal Metalwork',
    specialtyName: 'Trauma and Orthopaedics',
    subspecialtyName: 'Spine',
    opcs4: ['V241'],
    commonVariations: ['Spinal Hardware Removal']
  },

  // ============================================
  // GENERAL SURGERY
  // ============================================

  // Upper GI
  {
    name: 'Laparoscopic Cholecystectomy',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Upper GI',
    opcs4: ['J181'],
    commonVariations: ['Lap Chole', 'Keyhole Gallbladder Removal']
  },
  {
    name: 'Open Cholecystectomy',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Upper GI',
    opcs4: ['J182'],
    commonVariations: ['Open Gallbladder Removal']
  },
  {
    name: 'Laparoscopic Fundoplication',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Upper GI',
    opcs4: ['G271'],
    commonVariations: ['Nissen Fundoplication', 'Anti-reflux Surgery']
  },
  {
    name: 'Hiatus Hernia Repair',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Upper GI',
    opcs4: ['G271'],
    commonVariations: ['Hiatal Hernia Repair']
  },
  {
    name: 'Oesophagectomy',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Upper GI',
    opcs4: ['G011', 'G012'],
    commonVariations: ['Ivor Lewis', 'Three-stage Oesophagectomy']
  },
  {
    name: 'Total Gastrectomy',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Upper GI',
    opcs4: ['G011'],
    commonVariations: ['Gastrectomy']
  },
  {
    name: 'Partial Gastrectomy',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Upper GI',
    opcs4: ['G011'],
    commonVariations: ['Subtotal Gastrectomy']
  },
  {
    name: 'Laparoscopic Sleeve Gastrectomy',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Upper GI',
    opcs4: ['G281'],
    commonVariations: ['LSG', 'Gastric Sleeve']
  },
  {
    name: 'Laparoscopic Gastric Bypass',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Upper GI',
    opcs4: ['G281'],
    commonVariations: ['Roux-en-Y Gastric Bypass', 'RYGB']
  },
  {
    name: 'Gastric Band Insertion',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Upper GI',
    opcs4: ['G284'],
    commonVariations: ['Lap Band']
  },
  {
    name: 'Gastric Band Removal',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Upper GI',
    opcs4: ['G285'],
    commonVariations: ['Band Removal']
  },
  {
    name: 'Revision Bariatric Surgery',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Upper GI',
    opcs4: ['G281'],
    commonVariations: ['Revision Gastric Bypass']
  },
  {
    name: 'Laparoscopic Pyloromyotomy',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Upper GI',
    opcs4: ['G192'],
    commonVariations: ['Ramstedt Procedure']
  },
  {
    name: 'Vagotomy',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Upper GI',
    opcs4: ['A481'],
    commonVariations: ['Highly Selective Vagotomy']
  },
  {
    name: 'Gastrojejunostomy',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Upper GI',
    opcs4: ['G341'],
    commonVariations: ['GJ']
  },
  {
    name: 'Feeding Jejunostomy Insertion',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Upper GI',
    opcs4: ['G101'],
    commonVariations: ['Jejunostomy']
  },
  {
    name: 'PEG Insertion',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Upper GI',
    opcs4: ['G413'],
    commonVariations: ['Percutaneous Endoscopic Gastrostomy']
  },
  {
    name: 'PEG Removal',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Upper GI',
    opcs4: ['G414'],
    commonVariations: ['PEG Extraction']
  },
  {
    name: 'Perforated Peptic Ulcer Repair',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Upper GI',
    opcs4: ['G512'],
    commonVariations: ['Ulcer Perforation Repair', 'Omental Patch']
  },
  {
    name: 'Gastric Ulcer Oversew',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Upper GI',
    opcs4: ['G512'],
    commonVariations: ['Bleeding Ulcer Repair']
  },
  {
    name: 'Pancreaticoduodenectomy',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Upper GI',
    opcs4: ['J011', 'J691'],
    commonVariations: ['Whipples Procedure']
  },
  {
    name: 'Distal Pancreatectomy',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Upper GI',
    opcs4: ['J024'],
    commonVariations: ['Distal Pancreatectomy with Splenectomy']
  },
  {
    name: 'Pancreatic Necrosectomy',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Upper GI',
    opcs4: ['J062'],
    commonVariations: ['Debridement of Pancreatic Necrosis']
  },
  {
    name: 'Splenectomy',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Upper GI',
    opcs4: ['T701'],
    commonVariations: ['Spleen Removal']
  },
  {
    name: 'Laparoscopic Splenectomy',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Upper GI',
    opcs4: ['T701'],
    commonVariations: ['Lap Splenectomy']
  },
  {
    name: 'Hepatic Resection',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Upper GI',
    opcs4: ['J023'],
    commonVariations: ['Liver Resection', 'Hemihepatectomy']
  },
  {
    name: 'Liver Biopsy',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Upper GI',
    opcs4: ['J131'],
    commonVariations: ['Hepatic Biopsy']
  },
  {
    name: 'Bile Duct Exploration',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Upper GI',
    opcs4: ['J241'],
    commonVariations: ['Common Bile Duct Exploration']
  },
  {
    name: 'Choledochoduodenostomy',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Upper GI',
    opcs4: ['J341'],
    commonVariations: ['Biliary Bypass']
  },
  {
    name: 'Hepaticojejunostomy',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Upper GI',
    opcs4: ['J341'],
    commonVariations: ['Biliary-Enteric Anastomosis']
  },

  // Colorectal
  {
    name: 'Right Hemicolectomy',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Colorectal',
    opcs4: ['H061'],
    commonVariations: ['Right Colectomy']
  },
  {
    name: 'Left Hemicolectomy',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Colorectal',
    opcs4: ['H071'],
    commonVariations: ['Left Colectomy']
  },
  {
    name: 'Sigmoid Colectomy',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Colorectal',
    opcs4: ['H081'],
    commonVariations: ['Sigmoid Resection']
  },
  {
    name: 'Anterior Resection',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Colorectal',
    opcs4: ['H331'],
    commonVariations: ['AR', 'High Anterior Resection']
  },
  {
    name: 'Abdominoperineal Resection',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Colorectal',
    opcs4: ['H041'],
    commonVariations: ['APR', 'APER']
  },
  {
    name: 'Total Colectomy',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Colorectal',
    opcs4: ['H041'],
    commonVariations: ['Panproctocolectomy']
  },
  {
    name: 'Subtotal Colectomy',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Colorectal',
    opcs4: ['H041'],
    commonVariations: ['Subtotal Colectomy with Ileostomy']
  },
  {
    name: 'Hartmanns Procedure',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Colorectal',
    opcs4: ['H081'],
    commonVariations: ['Hartmann Procedure']
  },
  {
    name: 'Hartmanns Reversal',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Colorectal',
    opcs4: ['H331'],
    commonVariations: ['Hartmann Reversal']
  },
  {
    name: 'Loop Ileostomy Formation',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Colorectal',
    opcs4: ['H104'],
    commonVariations: ['Defunctioning Ileostomy']
  },
  {
    name: 'Loop Colostomy Formation',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Colorectal',
    opcs4: ['H104'],
    commonVariations: ['Defunctioning Colostomy']
  },
  {
    name: 'End Ileostomy Formation',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Colorectal',
    opcs4: ['H104'],
    commonVariations: ['Permanent Ileostomy']
  },
  {
    name: 'End Colostomy Formation',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Colorectal',
    opcs4: ['H104'],
    commonVariations: ['Permanent Colostomy']
  },
  {
    name: 'Ileostomy Closure',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Colorectal',
    opcs4: ['H271'],
    commonVariations: ['Ileostomy Reversal']
  },
  {
    name: 'Colostomy Closure',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Colorectal',
    opcs4: ['H271'],
    commonVariations: ['Colostomy Reversal']
  },
  {
    name: 'Ileo-anal Pouch Formation',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Colorectal',
    opcs4: ['H041', 'H331'],
    commonVariations: ['J-Pouch', 'Restorative Proctocolectomy']
  },
  {
    name: 'Haemorrhoidectomy',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Colorectal',
    opcs4: ['H511'],
    commonVariations: ['Milligan-Morgan', 'Ferguson Haemorrhoidectomy']
  },
  {
    name: 'Haemorrhoidal Artery Ligation',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Colorectal',
    opcs4: ['H513'],
    commonVariations: ['HAL', 'THD']
  },
  {
    name: 'Rubber Band Ligation of Haemorrhoids',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Colorectal',
    opcs4: ['H512'],
    commonVariations: ['Banding']
  },
  {
    name: 'Lateral Sphincterotomy',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Colorectal',
    opcs4: ['H522'],
    commonVariations: ['Anal Fissure Surgery']
  },
  {
    name: 'Anal Fistula Lay Open',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Colorectal',
    opcs4: ['H511'],
    commonVariations: ['Fistulotomy']
  },
  {
    name: 'Seton Insertion for Anal Fistula',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Colorectal',
    opcs4: ['H514'],
    commonVariations: ['Seton Placement']
  },
  {
    name: 'LIFT Procedure',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Colorectal',
    opcs4: ['H514'],
    commonVariations: ['Ligation of Intersphincteric Fistula Tract']
  },
  {
    name: 'Examination Under Anaesthetic - Anus',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Colorectal',
    opcs4: ['H551'],
    commonVariations: ['EUA']
  },
  {
    name: 'Incision and Drainage of Perianal Abscess',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Colorectal',
    opcs4: ['H511'],
    commonVariations: ['I&D Perianal Abscess']
  },
  {
    name: 'Pilonidal Sinus Excision',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Colorectal',
    opcs4: ['S061'],
    commonVariations: ['Pilonidal Abscess Excision']
  },
  {
    name: 'Rectal Prolapse Repair - Abdominal',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Colorectal',
    opcs4: ['H491'],
    commonVariations: ['Rectop exy', 'Ventral Rectopexy']
  },
  {
    name: 'Rectal Prolapse Repair - Perineal',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Colorectal',
    opcs4: ['H494'],
    commonVariations: ['Delorme Procedure', 'Altemeier Procedure']
  },
  {
    name: 'Colonoscopy and Polypectomy',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Colorectal',
    opcs4: ['H201', 'H421'],
    commonVariations: ['Endoscopic Polypectomy']
  },
  {
    name: 'Flexible Sigmoidoscopy',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Colorectal',
    opcs4: ['H221'],
    commonVariations: ['Flexi Sig']
  },

  // Breast
  {
    name: 'Wide Local Excision of Breast',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Breast',
    opcs4: ['B281'],
    commonVariations: ['WLE', 'Lumpectomy']
  },
  {
    name: 'Mastectomy',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Breast',
    opcs4: ['B271'],
    commonVariations: ['Simple Mastectomy']
  },
  {
    name: 'Skin-Sparing Mastectomy',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Breast',
    opcs4: ['B271'],
    commonVariations: ['SSM']
  },
  {
    name: 'Nipple-Sparing Mastectomy',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Breast',
    opcs4: ['B271'],
    commonVariations: ['NSM']
  },
  {
    name: 'Axillary Clearance',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Breast',
    opcs4: ['T851'],
    commonVariations: ['Axillary Lymph Node Dissection', 'ALND']
  },
  {
    name: 'Sentinel Lymph Node Biopsy',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Breast',
    opcs4: ['T851'],
    commonVariations: ['SLNB', 'Sentinel Node Biopsy']
  },
  {
    name: 'Breast Reconstruction - Implant',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Breast',
    opcs4: ['B391'],
    commonVariations: ['Implant-Based Reconstruction']
  },
  {
    name: 'Breast Reconstruction - LD Flap',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Breast',
    opcs4: ['B392'],
    commonVariations: ['Latissimus Dorsi Flap']
  },
  {
    name: 'Breast Reconstruction - DIEP Flap',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Breast',
    opcs4: ['B392'],
    commonVariations: ['Deep Inferior Epigastric Perforator Flap']
  },
  {
    name: 'Breast Reconstruction - TRAM Flap',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Breast',
    opcs4: ['B392'],
    commonVariations: ['Transverse Rectus Abdominis Myocutaneous Flap']
  },
  {
    name: 'Tissue Expander Insertion',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Breast',
    opcs4: ['B391'],
    commonVariations: ['Expander Placement']
  },
  {
    name: 'Tissue Expander to Implant Exchange',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Breast',
    opcs4: ['B394'],
    commonVariations: ['Expander Exchange']
  },
  {
    name: 'Nipple Reconstruction',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Breast',
    opcs4: ['B391'],
    commonVariations: ['Nipple Creation']
  },
  {
    name: 'Breast Reduction',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Breast',
    opcs4: ['B281'],
    commonVariations: ['Reduction Mammoplasty']
  },
  {
    name: 'Breast Augmentation',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Breast',
    opcs4: ['B391'],
    commonVariations: ['Breast Implants', 'Augmentation Mammoplasty']
  },
  {
    name: 'Mastopexy',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Breast',
    opcs4: ['B282'],
    commonVariations: ['Breast Lift']
  },
  {
    name: 'Gynaecomastia Correction',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Breast',
    opcs4: ['B281'],
    commonVariations: ['Male Breast Reduction']
  },
  {
    name: 'Breast Cyst Aspiration',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Breast',
    opcs4: ['B193'],
    commonVariations: ['Fine Needle Aspiration']
  },
  {
    name: 'Core Biopsy of Breast',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Breast',
    opcs4: ['B131'],
    commonVariations: ['Breast Biopsy']
  },
  {
    name: 'Vacuum Assisted Biopsy',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Breast',
    opcs4: ['B131'],
    commonVariations: ['VAB', 'Mammotome']
  },
  {
    name: 'Wire-Guided Excision',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Breast',
    opcs4: ['B281'],
    commonVariations: ['Hook-Wire Excision']
  },
  {
    name: 'Microdochectomy',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Breast',
    opcs4: ['B281'],
    commonVariations: ['Duct Excision']
  },
  {
    name: 'Hadfields Procedure',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Breast',
    opcs4: ['B281'],
    commonVariations: ['Total Duct Excision']
  },
  {
    name: 'Excision of Breast Abscess',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Breast',
    opcs4: ['B281'],
    commonVariations: ['Breast Abscess Drainage']
  },
  {
    name: 'Implant Removal',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Breast',
    opcs4: ['B393'],
    commonVariations: ['Explantation']
  },
  {
    name: 'Implant Removal and Replacement',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Breast',
    opcs4: ['B394'],
    commonVariations: ['Implant Exchange']
  },
  {
    name: 'Fat Grafting to Breast',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Breast',
    opcs4: ['B391'],
    commonVariations: ['Lipofilling']
  },
  {
    name: 'Capsulectomy',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Breast',
    opcs4: ['B281'],
    commonVariations: ['Capsule Removal']
  },
  {
    name: 'Latissimus Dorsi Mini-Flap',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Breast',
    opcs4: ['B392'],
    commonVariations: ['LD Mini-Flap']
  },
  {
    name: 'Therapeutic Mammoplasty',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Breast',
    opcs4: ['B281'],
    commonVariations: ['Oncoplastic Surgery']
  },

  // Vascular
  {
    name: 'Carotid Endarterectomy',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Vascular',
    opcs4: ['L261'],
    commonVariations: ['CEA']
  },
  {
    name: 'Femoral Endarterectomy',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Vascular',
    opcs4: ['L271'],
    commonVariations: ['Common Femoral Endarterectomy']
  },
  {
    name: 'Aorto-Bifemoral Bypass',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Vascular',
    opcs4: ['L241'],
    commonVariations: ['Aortobifemoral Graft']
  },
  {
    name: 'Femoro-Popliteal Bypass',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Vascular',
    opcs4: ['L511'],
    commonVariations: ['Fem-Pop Bypass']
  },
  {
    name: 'Femoro-Distal Bypass',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Vascular',
    opcs4: ['L511'],
    commonVariations: ['Fem-Distal Bypass']
  },
  {
    name: 'Abdominal Aortic Aneurysm Repair - Open',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Vascular',
    opcs4: ['L181'],
    commonVariations: ['AAA Repair', 'Open AAA']
  },
  {
    name: 'Endovascular Aneurysm Repair',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Vascular',
    opcs4: ['L271'],
    commonVariations: ['EVAR']
  },
  {
    name: 'Thoracic Endovascular Aneurysm Repair',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Vascular',
    opcs4: ['L271'],
    commonVariations: ['TEVAR']
  },
  {
    name: 'Femoral Embolectomy',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Vascular',
    opcs4: ['L241'],
    commonVariations: ['Embolectomy']
  },
  {
    name: 'Fasciotomy - Lower Limb',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Vascular',
    opcs4: ['T561'],
    commonVariations: ['Compartment Syndrome Release']
  },
  {
    name: 'Below Knee Amputation',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Vascular',
    opcs4: ['X092'],
    commonVariations: ['BKA']
  },
  {
    name: 'Above Knee Amputation',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Vascular',
    opcs4: ['X091'],
    commonVariations: ['AKA']
  },
  {
    name: 'Toe Amputation',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Vascular',
    opcs4: ['X101'],
    commonVariations: ['Digital Amputation']
  },
  {
    name: 'Transmetatarsal Amputation',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Vascular',
    opcs4: ['X093'],
    commonVariations: ['TMA']
  },
  {
    name: 'Arteriovenous Fistula Creation',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Vascular',
    opcs4: ['L421'],
    commonVariations: ['AVF', 'Brescia-Cimino Fistula']
  },
  {
    name: 'Arteriovenous Graft Insertion',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Vascular',
    opcs4: ['L511'],
    commonVariations: ['AVG']
  },
  {
    name: 'Varicose Vein Surgery',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Vascular',
    opcs4: ['L851'],
    commonVariations: ['Stripping and Ligation']
  },
  {
    name: 'Endovenous Laser Ablation',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Vascular',
    opcs4: ['L852'],
    commonVariations: ['EVLA', 'Laser Ablation']
  },
  {
    name: 'Radiofrequency Ablation of Varicose Veins',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Vascular',
    opcs4: ['L852'],
    commonVariations: ['RFA']
  },
  {
    name: 'VenaSeal',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Vascular',
    opcs4: ['L852'],
    commonVariations: ['Cyanoacrylate Ablation']
  },
  {
    name: 'Foam Sclerotherapy',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Vascular',
    opcs4: ['L912'],
    commonVariations: ['Varicose Vein Sclerotherapy']
  },
  {
    name: 'IVC Filter Insertion',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Vascular',
    opcs4: ['L511'],
    commonVariations: ['Inferior Vena Cava Filter']
  },
  {
    name: 'Thrombectomy',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Vascular',
    opcs4: ['L241'],
    commonVariations: ['Arterial Thrombectomy']
  },
  {
    name: 'Axillo-Bifemoral Bypass',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Vascular',
    opcs4: ['L511'],
    commonVariations: ['Axillo-Fem Bypass']
  },
  {
    name: 'Profundaplasty',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Vascular',
    opcs4: ['L261'],
    commonVariations: ['Profunda Femoris Endarterectomy']
  },
  {
    name: 'Carotid Angioplasty and Stenting',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Vascular',
    opcs4: ['L271'],
    commonVariations: ['CAS']
  },
  {
    name: 'Peripheral Angioplasty',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Vascular',
    opcs4: ['L271'],
    commonVariations: ['PTA', 'Balloon Angioplasty']
  },
  {
    name: 'Debridement of Ulcer',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Vascular',
    opcs4: ['S571'],
    commonVariations: ['Wound Debridement']
  },
  {
    name: 'Split Skin Graft',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Vascular',
    opcs4: ['S321'],
    commonVariations: ['SSG']
  },
  {
    name: 'Sympathectomy - Lumbar',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Vascular',
    opcs4: ['A551'],
    commonVariations: ['Lumbar Sympathectomy']
  },

  // Emergency
  {
    name: 'Appendicectomy - Laparoscopic',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Emergency',
    opcs4: ['H011'],
    commonVariations: ['Lap Appy', 'Laparoscopic Appendicectomy']
  },
  {
    name: 'Appendicectomy - Open',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Emergency',
    opcs4: ['H012'],
    commonVariations: ['Open Appendicectomy']
  },
  {
    name: 'Laparotomy - Exploratory',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Emergency',
    opcs4: ['T421'],
    commonVariations: ['Exploratory Lap', 'Ex-Lap']
  },
  {
    name: 'Laparotomy and Peritoneal Lavage',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Emergency',
    opcs4: ['T421', 'T511'],
    commonVariations: ['Laparotomy and Washout']
  },
  {
    name: 'Bowel Resection and Primary Anastomosis',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Emergency',
    opcs4: ['H061'],
    commonVariations: ['Small Bowel Resection']
  },
  {
    name: 'Small Bowel Resection',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Emergency',
    opcs4: ['G761'],
    commonVariations: ['Ileal Resection']
  },
  {
    name: 'Adhesiolysis',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Emergency',
    opcs4: ['T781'],
    commonVariations: ['Division of Adhesions']
  },
  {
    name: 'Repair of Perforated Viscus',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Emergency',
    opcs4: ['G512'],
    commonVariations: ['Perforation Repair']
  },
  {
    name: 'Splenectomy - Trauma',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Emergency',
    opcs4: ['T701'],
    commonVariations: ['Emergency Splenectomy']
  },
  {
    name: 'Liver Laceration Repair',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Emergency',
    opcs4: ['J511'],
    commonVariations: ['Hepatic Injury Repair']
  },
  {
    name: 'Damage Control Laparotomy',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Emergency',
    opcs4: ['T421'],
    commonVariations: ['DCL']
  },
  {
    name: 'Abdominal Packing',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Emergency',
    opcs4: ['T791'],
    commonVariations: ['Laparotomy Packing']
  },
  {
    name: 'Second Look Laparotomy',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Emergency',
    opcs4: ['T421'],
    commonVariations: ['Re-look Laparotomy']
  },
  {
    name: 'Inguinal Hernia Repair',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Emergency',
    opcs4: ['T201'],
    commonVariations: ['Hernia Repair', 'Lichtenstein Repair']
  },
  {
    name: 'Femoral Hernia Repair',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Emergency',
    opcs4: ['T211'],
    commonVariations: ['Femoral Herniorrhaphy']
  },
  {
    name: 'Umbilical Hernia Repair',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Emergency',
    opcs4: ['T231'],
    commonVariations: ['Umbilical Herniorrhaphy']
  },
  {
    name: 'Incisional Hernia Repair',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Emergency',
    opcs4: ['T241'],
    commonVariations: ['Ventral Hernia Repair']
  },
  {
    name: 'Parastomal Hernia Repair',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Emergency',
    opcs4: ['T241'],
    commonVariations: ['Parastomal Herniorrhaphy']
  },
  {
    name: 'Strangulated Hernia Repair',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Emergency',
    opcs4: ['T201'],
    commonVariations: ['Emergency Hernia Repair']
  },
  {
    name: 'Abscess Drainage - Abdominal',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Emergency',
    opcs4: ['T481'],
    commonVariations: ['Intra-abdominal Collection Drainage']
  },
  {
    name: 'Necrotising Fasciitis Debridement',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Emergency',
    opcs4: ['S571'],
    commonVariations: ['Surgical Debridement NF']
  },
  {
    name: 'Oesophageal Perforation Repair',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Emergency',
    opcs4: ['G512'],
    commonVariations: ['Boerhaave Repair']
  },
  {
    name: 'Bleeding Peptic Ulcer - Emergency',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Emergency',
    opcs4: ['G512'],
    commonVariations: ['Emergency Ulcer Repair']
  },
  {
    name: 'Testicular Torsion Exploration',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Emergency',
    opcs4: ['N181'],
    commonVariations: ['Scrotal Exploration']
  },
  {
    name: 'Fournier Gangrene Debridement',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Emergency',
    opcs4: ['S571'],
    commonVariations: ['Perineal Debridement']
  },
  {
    name: 'Tracheostomy - Emergency',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Emergency',
    opcs4: ['E421'],
    commonVariations: ['Emergency Tracheostomy']
  },
  {
    name: 'Diagnostic Laparoscopy',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Emergency',
    opcs4: ['Y751'],
    commonVariations: ['Lap and Dye']
  },
  {
    name: 'Meckel Diverticulum Excision',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Emergency',
    opcs4: ['G761'],
    commonVariations: ['Meckelonectomy']
  },
  {
    name: 'Ischaemic Bowel Resection',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Emergency',
    opcs4: ['G761', 'H061'],
    commonVariations: ['Mesenteric Ischaemia Surgery']
  },
  {
    name: 'Volvulus Reduction',
    specialtyName: 'General Surgery',
    subspecialtyName: 'Emergency',
    opcs4: ['H481'],
    commonVariations: ['Sigmoid Volvulus Decompression']
  },

  // ============================================
  // ENT (EAR NOSE AND THROAT)
  // ============================================

  // Otology
  {
    name: 'Myringotomy and Grommet Insertion',
    specialtyName: 'Ear Nose and Throat',
    subspecialtyName: 'Otology',
    opcs4: ['D151'],
    commonVariations: ['Grommets', 'Ventilation Tubes']
  },
  {
    name: 'Tympanoplasty',
    specialtyName: 'Ear Nose and Throat',
    subspecialtyName: 'Otology',
    opcs4: ['D141'],
    commonVariations: ['Myringoplasty', 'Eardrum Repair']
  },
  {
    name: 'Mastoidectomy',
    specialtyName: 'Ear Nose and Throat',
    subspecialtyName: 'Otology',
    opcs4: ['D101'],
    commonVariations: ['Cortical Mastoidectomy']
  },
  {
    name: 'Modified Radical Mastoidectomy',
    specialtyName: 'Ear Nose and Throat',
    subspecialtyName: 'Otology',
    opcs4: ['D102'],
    commonVariations: ['MRM']
  },
  {
    name: 'Stapedectomy',
    specialtyName: 'Ear Nose and Throat',
    subspecialtyName: 'Otology',
    opcs4: ['D161'],
    commonVariations: ['Stapes Surgery']
  },
  {
    name: 'Stapedotomy',
    specialtyName: 'Ear Nose and Throat',
    subspecialtyName: 'Otology',
    opcs4: ['D161'],
    commonVariations: ['Stapedotomy with Piston']
  },
  {
    name: 'Ossiculoplasty',
    specialtyName: 'Ear Nose and Throat',
    subspecialtyName: 'Otology',
    opcs4: ['D141'],
    commonVariations: ['Ossicular Chain Reconstruction']
  },
  {
    name: 'Cochlear Implant Insertion',
    specialtyName: 'Ear Nose and Throat',
    subspecialtyName: 'Otology',
    opcs4: ['D201'],
    commonVariations: ['Cochlear Implant']
  },
  {
    name: 'Bone Anchored Hearing Aid Insertion',
    specialtyName: 'Ear Nose and Throat',
    subspecialtyName: 'Otology',
    opcs4: ['D202'],
    commonVariations: ['BAHA']
  },
  {
    name: 'Removal of Foreign Body - Ear',
    specialtyName: 'Ear Nose and Throat',
    subspecialtyName: 'Otology',
    opcs4: ['D481'],
    commonVariations: ['FB Removal Ear']
  },
  {
    name: 'Examination Under Anaesthetic - Ear',
    specialtyName: 'Ear Nose and Throat',
    subspecialtyName: 'Otology',
    opcs4: ['D551'],
    commonVariations: ['EUA Ear']
  },
  {
    name: 'Aural Toilet',
    specialtyName: 'Ear Nose and Throat',
    subspecialtyName: 'Otology',
    opcs4: ['D571'],
    commonVariations: ['Micro-suction']
  },
  {
    name: 'Canal Wall Up Mastoidectomy',
    specialtyName: 'Ear Nose and Throat',
    subspecialtyName: 'Otology',
    opcs4: ['D101'],
    commonVariations: ['CWU Mastoidectomy']
  },
  {
    name: 'Canal Wall Down Mastoidectomy',
    specialtyName: 'Ear Nose and Throat',
    subspecialtyName: 'Otology',
    opcs4: ['D102'],
    commonVariations: ['CWD Mastoidectomy']
  },
  {
    name: 'Cholesteatoma Excision',
    specialtyName: 'Ear Nose and Throat',
    subspecialtyName: 'Otology',
    opcs4: ['D101', 'D141'],
    commonVariations: ['Cholesteatoma Removal']
  },
  {
    name: 'Tympanic Membrane Repair',
    specialtyName: 'Ear Nose and Throat',
    subspecialtyName: 'Otology',
    opcs4: ['D141'],
    commonVariations: ['TM Repair']
  },
  {
    name: 'Meatoplasty',
    specialtyName: 'Ear Nose and Throat',
    subspecialtyName: 'Otology',
    opcs4: ['D251'],
    commonVariations: ['EAC Meatoplasty']
  },
  {
    name: 'Otoplasty',
    specialtyName: 'Ear Nose and Throat',
    subspecialtyName: 'Otology',
    opcs4: ['D271'],
    commonVariations: ['Pinnaplasty', 'Bat Ear Correction']
  },
  {
    name: 'Excision of Preauricular Sinus',
    specialtyName: 'Ear Nose and Throat',
    subspecialtyName: 'Otology',
    opcs4: ['D081'],
    commonVariations: ['Preauricular Pit Excision']
  },
  {
    name: 'Excision of Auricular Keloid',
    specialtyName: 'Ear Nose and Throat',
    subspecialtyName: 'Otology',
    opcs4: ['S551'],
    commonVariations: ['Keloid Excision']
  },
  {
    name: 'Incision and Drainage of Auricular Haematoma',
    specialtyName: 'Ear Nose and Throat',
    subspecialtyName: 'Otology',
    opcs4: ['D491'],
    commonVariations: ['I&D Haematoma Pinna']
  },
  {
    name: 'Vestibular Schwannoma Excision',
    specialtyName: 'Ear Nose and Throat',
    subspecialtyName: 'Otology',
    opcs4: ['A072'],
    commonVariations: ['Acoustic Neuroma Removal']
  },
  {
    name: 'Endolymphatic Sac Decompression',
    specialtyName: 'Ear Nose and Throat',
    subspecialtyName: 'Otology',
    opcs4: ['D171'],
    commonVariations: ['ES Decompression']
  },
  {
    name: 'Labyrinthectomy',
    specialtyName: 'Ear Nose and Throat',
    subspecialtyName: 'Otology',
    opcs4: ['D171'],
    commonVariations: ['Vestibular Ablation']
  },
  {
    name: 'Posterior Semicircular Canal Occlusion',
    specialtyName: 'Ear Nose and Throat',
    subspecialtyName: 'Otology',
    opcs4: ['D171'],
    commonVariations: ['PSCC Occlusion']
  },
  {
    name: 'Round Window Reinforcement',
    specialtyName: 'Ear Nose and Throat',
    subspecialtyName: 'Otology',
    opcs4: ['D141'],
    commonVariations: ['Superior Canal Dehiscence Repair']
  },
  {
    name: 'Revision Cochlear Implant',
    specialtyName: 'Ear Nose and Throat',
    subspecialtyName: 'Otology',
    opcs4: ['D203'],
    commonVariations: ['Cochlear Implant Revision']
  },
  {
    name: 'Temporal Bone Resection',
    specialtyName: 'Ear Nose and Throat',
    subspecialtyName: 'Otology',
    opcs4: ['D032'],
    commonVariations: ['Lateral Temporal Bone Resection']
  },
  {
    name: 'Facial Nerve Decompression',
    specialtyName: 'Ear Nose and Throat',
    subspecialtyName: 'Otology',
    opcs4: ['A651'],
    commonVariations: ['Facial Nerve Release']
  },
  {
    name: 'Facial Nerve Repair',
    specialtyName: 'Ear Nose and Throat',
    subspecialtyName: 'Otology',
    opcs4: ['A491'],
    commonVariations: ['Facial Nerve Grafting']
  },
];

/**
 * Main seed function
 */
async function seedProcedures() {
  console.log('🌱 Starting procedure seed...');
  console.log(`📊 Total procedures to seed: ${procedures.length}`);

  let successCount = 0;
  let errorCount = 0;

  for (const procedure of procedures) {
    try {
      // Generate unique ID from procedure name
      const id = procedure.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const docRef = doc(db, 'procedures', id);
      await setDoc(docRef, procedure);

      successCount++;
      if (successCount % 50 === 0) {
        console.log(`✅ Seeded ${successCount} procedures...`);
      }
    } catch (error) {
      console.error(`❌ Error seeding procedure "${procedure.name}":`, error);
      errorCount++;
    }
  }

  console.log('\n✨ Seed complete!');
  console.log(`✅ Successfully seeded: ${successCount} procedures`);
  if (errorCount > 0) {
    console.log(`❌ Errors: ${errorCount}`);
  }

  // Summary by specialty
  const bySpecialty = procedures.reduce((acc, proc) => {
    const key = proc.subspecialtyName
      ? `${proc.specialtyName} > ${proc.subspecialtyName}`
      : proc.specialtyName;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('\n📈 Procedures by Specialty/Subspecialty:');
  Object.entries(bySpecialty).forEach(([key, count]) => {
    console.log(`  ${key}: ${count} procedures`);
  });
}

// Run the seed
seedProcedures()
  .then(() => {
    console.log('\n🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
