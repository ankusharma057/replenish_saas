# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: "Star Wars" }, { name: "Lord of the Rings" }])
#   Character.create(name: "Luke", movie: movies.first)

require "faker"
puts "Seeding data"

Employee.destroy_all
Invoice.destroy_all
Client.destroy_all
Product.destroy_all

Employee.create(
    name: "Allen Carrera",
    email: "allen@email.com",
    password: "test123",
    is_admin: true
)

Employee.create(
    name: "John Smith",
    email: "test@email.com",
    password: "test12345",
    is_admin: false
)

Employee.create(
    name: "Justin Gaethje",
    email: "justin@email.com",
    password: "justin123",
    is_admin: false
)

Employee.create(
    name: "Jon Snow",
    email: "john@email.com",
    password: "snow123",
    is_admin: true
)

Employee.create(
    name: "Jennifer Walker",
    email: "jennifer@email.com",
    password: "test12345",
    is_admin: false
)

Employee.create(
    name: "Tyler Clark",
    email: "Tyler@email.com",
    password: "test12345",
    is_admin: true
)

Employee.create(
    name: "Kris Johnson",
    email: "kris@email.com",
    password: "test12345",
    is_admin: false
)

Product.create(
    name: "Botox",
    product_type: "Neurotoxins",
    cost_price: 6.44,
    retail_price: 12

)

Product.create(
    name: "Dysport",
    product_type: "Neurotoxins",
    cost_price: 1.93,
    retail_price: 5

)

Product.create(
    name: "Kybella",
    product_type: "Fat Dissolvers",
    cost_price: 300,
    retail_price: 650

)

Product.create(
    name: "Sculptra",
    product_type: "PLLA Based Filler",
    cost_price: 422,
    retail_price: 850

)

Product.create(
    name: "Juvederm Ultra",
    product_type: "Juvederm",
    cost_price: 350,
    retail_price: 700

)


Product.create(
    name: "Juvederm Ultra Plus XC",
    product_type: "Juvederm",
    cost_price: 350,
    retail_price: 700

)


Product.create(
    name: "Vollure",
    product_type: "Juvederm",
    cost_price: 376,
    retail_price: 750

)


Product.create(
    name: "Volbella",
    product_type: "Juvederm",
    cost_price: 376,
    retail_price: 750

)

Product.create(
    name: "Voluma",
    product_type: "Juvederm",
    cost_price: 416.5,
    retail_price: 800

)

Product.create(
    name: "Vollure",
    product_type: "Restylane",
    cost_price: 306,
    retail_price: 700

)
Product.create(
    name: "Lyft",
    product_type: "Restylane",
    cost_price: 325,
    retail_price: 700

)

Product.create(
    name: "Silk",
    product_type: "Restylane",
    cost_price: 312,
    retail_price: 700

)

Product.create(
    name: "Refyne",
    product_type: "Restylane",
    cost_price: 370,
    retail_price: 740

)
Product.create(
    name: "Defyne",
    product_type: "Restylane",
    cost_price: 370,
    retail_price: 740

)

Product.create(
    name: "Kysse",
    product_type: "Restylane",
    cost_price: 387,
    retail_price: 775

)

Product.create(
    name: "Contour",
    product_type: "Restylane",
    cost_price: 387,
    retail_price: 775

)


Product.create(
    name: "Redensity",
    product_type: "Revance",
    cost_price: 300,
    retail_price: 650

)
Product.create(
    name: "RHA2",
    product_type: "Revance",
    cost_price: 300,
    retail_price: 650

)

Product.create(
    name: "RHA3",
    product_type: "Revance",
    cost_price: 300,
    retail_price: 650

)
Product.create(
    name: "RHA4",
    product_type: "Revance",
    cost_price: 300,
    retail_price: 650

)

Product.create(
    name: "Versa",
    product_type: "Prollenium",
    cost_price: 250,
    retail_price: 600

)
Product.create(
    name: "Revanesse Lips",
    product_type: "Prollenium",
    cost_price: 250,
    retail_price: 600

)

Product.create(
    name: "Replenish",
    product_type: "IV Therapy Kits/IV Drips",
    cost_price: 60,
    retail_price: 300

)
Product.create(
    name: "Myer's",
    product_type: "IV Therapy Kits/IV Drips",
    cost_price: 30,
    retail_price: 225

)

Product.create(
    name: "Immunity",
    product_type: "IV Therapy Kits/IV Drips",
    cost_price: 52,
    retail_price: 275

)

Product.create(
    name: "After Party",
    product_type: "IV Therapy Kits/IV Drips",
    cost_price: 25,
    retail_price: 225

)

Product.create(
    name: "Hydrate",
    product_type: "IV Therapy Kits/IV Drips",
    cost_price: 18,
    retail_price: 150

)

Product.create(
    name: "Fit",
    product_type: "IV Therapy Kits/IV Drips",
    cost_price: 28,
    retail_price: 225

)
Product.create(
    name: "Slim",
    product_type: "IV Therapy Kits/IV Drips",
    cost_price: 24,
    retail_price: 225

)

Product.create(
    name: "Beauty",
    product_type: "IV Therapy Kits/IV Drips",
    cost_price: 32,
    retail_price: 225

)
Product.create(
    name: "Libido",
    product_type: "IV Therapy Kits/IV Drips",
    cost_price: 21,
    retail_price: 225

)

Product.create(
    name: "NAD+ 250mg",
    product_type: "IV Therapy Kits/IV Drips",
    cost_price: 63,
    retail_price: 325

)
Product.create(
    name: "NAD+ 500mg",
    product_type: "IV Therapy Kits/IV Drips",
    cost_price: 106,
    retail_price: 500

)

Product.create(
    name: "Vit C 1500mg",
    product_type: "IV Boosters",
    cost_price: 3.1,
    retail_price: 25

)

Product.create(
    name: "Vit C 10,000mg",
    product_type: "IV Boosters",
    cost_price: 21,
    retail_price: 75

)

Product.create(
    name: "B12",
    product_type: "IV Boosters",
    cost_price: 2,
    retail_price: 25

)
Product.create(
    name: "B-Complex",
    product_type: "IV Boosters",
    cost_price: 3,
    retail_price: 25

)

Product.create(
    name: "MgCl",
    product_type: "IV Boosters",
    cost_price: 2,
    retail_price: 25

)
Product.create(
    name: "Ca",
    product_type: "IV Boosters",
    cost_price: 4,
    retail_price: 25

)
Product.create(
    name: "Zinc",
    product_type: "IV Boosters",
    cost_price: 3,
    retail_price: 25

)

Product.create(
    name: "Glutathione",
    product_type: "IV Boosters",
    cost_price: 8.7,
    retail_price: 50

)

Product.create(
    name: "Arginine",
    product_type: "IV Boosters",
    cost_price: 2,
    retail_price: 25

)
Product.create(
    name: "Carnitine",
    product_type: "IV Boosters",
    cost_price: 4,
    retail_price: 25

)
Product.create(
    name: "Taurine",
    product_type: "IV Boosters",
    cost_price: 2,
    retail_price: 25

)

Product.create(
    name: "Proline",
    product_type: "IV Boosters",
    cost_price: 2,
    retail_price: 25

)
Product.create(
    name: "Amino Blend",
    product_type: "IV Boosters",
    cost_price: 5,
    retail_price: 50

)
Product.create(
    name: "Zofran",
    product_type: "IV Boosters",
    cost_price: 2,
    retail_price: 25

)
Product.create(
    name: "Toradol",
    product_type: "IV Boosters",
    cost_price: 3,
    retail_price: 25

)
Product.create(
    name: "Lipo C Shot IM",
    product_type: "IV Boosters",
    cost_price: 3,
    retail_price: 40

)
Product.create(
    name: "B12 Shot IM",
    product_type: "IV Boosters",
    cost_price: 2,
    retail_price: 40

)

Product.create(
    name: "Full Body",
    product_type: "(Xeo) Laser Hair Removal",
    cost_price: 520,
    retail_price: 520

)

Product.create(
    name: "Upper Body",
    product_type: "(Xeo) Laser Hair Removal",
    cost_price: 300,
    retail_price: 300

)
# Product.create(
#     name: "Botox",
#     product_type: "Neurotoxins",
#     cost_price: 7,
#     retail_price: 13

# )


# Product.create(
#     name: "Kybella",
#     product_type: "Fat Dissolvers",
#     cost_price: 600,
#     retail_price: 1200

# )

# Product.create(
#     name: "Juvederm Ultra XC",
#     product_type: "Juvederm",
#     cost_price: 350,
#     retail_price: 700

# )

# Product.create(
#     name: "Juvederm Ultra Plus XC",
#     product_type: "Juvederm",
#     cost_price: 350,
#     retail_price: 700

# )

# Product.create(
#     name: "Voluma",
#     product_type: "Juvederm",
#     cost_price: 416,
#     retail_price: 800

# )

# Product.create(
#     name: "RHA2",
#     product_type: "Revance",
#     cost_price: 300,
#     retail_price: 650

# )

# Product.create(
#     name: "RHA3",
#     product_type: "Revance",
#     cost_price: 300,
#     retail_price: 650

# )
# Product.create(
#     name: "Redensity",
#     product_type: "Revance",
#     cost_price: 300,
#     retail_price: 650

# )

# Product.create(
#     name: "Versa",
#     product_type: "Prollenium",
#     cost_price: 250,
#     retail_price: 600

# )

# Product.create(
#     name: "Revenesse Lips",
#     product_type: "Prollenium",
#     cost_price: 250,
#     retail_price: 600

# )

# Product.create(
#     name: "Vit C 1500mg",
#     product_type: "IV Boosters",
#     cost_price: 3,
#     retail_price: 25

# )

# Product.create(
#     name: "Vit C 10000mg",
#     product_type: "IV Boosters",
#     cost_price: 21,
#     retail_price: 75

# )

15.times do
    Client.create(
        name: Faker::Books::Dune.character,
        employee_id: Employee.all.sample.id
    )
end

40.times do
    Invoice.create!(
        employee_id: Employee.all.sample.id,
        product_id: Product.all.sample.id, 
        client_id: Client.all.sample.id,
        charge: Product.all.sample.retail_price 
    )
    end